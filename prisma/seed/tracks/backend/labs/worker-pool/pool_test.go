package lab

import (
	"context"
	"errors"
	"runtime"
	"sync/atomic"
	"testing"
	"time"
)

// tracker records how many calls run at the same time.
type tracker struct {
	inFlight, peak, calls atomic.Int64
}

func (tr *tracker) enter() {
	tr.calls.Add(1)
	n := tr.inFlight.Add(1)
	for {
		p := tr.peak.Load()
		if n <= p || tr.peak.CompareAndSwap(p, n) {
			return
		}
	}
}

func (tr *tracker) exit() { tr.inFlight.Add(-1) }

func TestOrderAndConcurrencyLimit(t *testing.T) {
	var tr tracker
	items := make([]int, 40)
	for i := range items {
		items[i] = i
	}
	out, err := Map(context.Background(), items, 4, func(_ context.Context, x int) (int, error) {
		tr.enter()
		defer tr.exit()
		time.Sleep(5 * time.Millisecond)
		return x * x, nil
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(out) != len(items) {
		t.Fatalf("len(out) = %d; want %d", len(out), len(items))
	}
	for i, v := range out {
		if v != i*i {
			t.Fatalf("out[%d] = %d; want %d (results must keep input order)", i, v, i*i)
		}
	}
	if p := tr.peak.Load(); p > 4 {
		t.Fatalf("peak concurrency = %d; limit was 4", p)
	}
	if p := tr.peak.Load(); p < 2 {
		t.Fatalf("peak concurrency = %d; the work is not running in parallel", p)
	}
}

func TestStopsOnFirstError(t *testing.T) {
	var tr tracker
	boom := errors.New("boom")
	items := make([]int, 200)
	for i := range items {
		items[i] = i
	}
	_, err := Map(context.Background(), items, 2, func(ctx context.Context, x int) (int, error) {
		tr.enter()
		defer tr.exit()
		if x == 3 {
			return 0, boom
		}
		select {
		case <-time.After(10 * time.Millisecond):
		case <-ctx.Done():
			return 0, ctx.Err()
		}
		return x, nil
	})
	if !errors.Is(err, boom) {
		t.Fatalf("err = %v; want the first error (boom)", err)
	}
	if c := tr.calls.Load(); c > 20 {
		t.Fatalf("fn was called %d times after an early error; Map must stop starting new work", c)
	}
	if n := tr.inFlight.Load(); n != 0 {
		t.Fatalf("%d calls still running after Map returned", n)
	}
}

func TestContextCancellation(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Millisecond)
	defer cancel()
	items := make([]int, 1000)
	start := time.Now()
	_, err := Map(ctx, items, 3, func(ctx context.Context, x int) (int, error) {
		select {
		case <-time.After(10 * time.Millisecond):
			return x, nil
		case <-ctx.Done():
			return 0, ctx.Err()
		}
	})
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("err = %v; want context.DeadlineExceeded", err)
	}
	if time.Since(start) > time.Second {
		t.Fatal("Map kept working long after ctx was cancelled")
	}
}

func TestNoGoroutinesLeftBehind(t *testing.T) {
	before := runtime.NumGoroutine()
	for i := 0; i < 5; i++ {
		_, _ = Map(context.Background(), []int{1, 2, 3, 4, 5}, 3, func(_ context.Context, x int) (int, error) {
			return x, nil
		})
	}
	time.Sleep(50 * time.Millisecond)
	if after := runtime.NumGoroutine(); after > before {
		t.Fatalf("goroutines before=%d after=%d", before, after)
	}
}

func TestEdgeCases(t *testing.T) {
	out, err := Map(context.Background(), []string{}, 3, func(_ context.Context, s string) (int, error) {
		return len(s), nil
	})
	if err != nil || len(out) != 0 {
		t.Fatalf("empty input: (%v, %v)", out, err)
	}
	out, err = Map(context.Background(), []string{"a", "bb"}, 0, func(_ context.Context, s string) (int, error) {
		return len(s), nil
	})
	if err != nil || len(out) != 2 || out[1] != 2 {
		t.Fatalf("workers=0 should behave like 1: (%v, %v)", out, err)
	}
}
