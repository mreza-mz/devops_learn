package lab

import (
	"context"
	"errors"
	"runtime"
	"sync/atomic"
	"testing"
	"time"
)

func fixed(v string, d time.Duration) Fetcher {
	return func(ctx context.Context) (string, error) {
		select {
		case <-time.After(d):
			return v, nil
		case <-ctx.Done():
			return "", ctx.Err()
		}
	}
}

func failing(d time.Duration) Fetcher {
	return func(context.Context) (string, error) {
		time.Sleep(d)
		return "", errors.New("replica down")
	}
}

// waitForGoroutines polls until the goroutine count drops to want (or times out).
func waitForGoroutines(want int, timeout time.Duration) int {
	deadline := time.Now().Add(timeout)
	for {
		n := runtime.NumGoroutine()
		if n <= want || time.Now().After(deadline) {
			return n
		}
		time.Sleep(10 * time.Millisecond)
	}
}

func TestReturnsFastestResult(t *testing.T) {
	got, err := FirstResult(context.Background(), []Fetcher{
		fixed("slow", 300*time.Millisecond),
		fixed("fast", 10*time.Millisecond),
	})
	if err != nil || got != "fast" {
		t.Fatalf("FirstResult = (%q, %v); want (\"fast\", nil)", got, err)
	}
}

func TestNoGoroutineLeak(t *testing.T) {
	before := runtime.NumGoroutine()
	for i := 0; i < 20; i++ {
		// Fast results that finish right after the winner: in the buggy
		// version their send has no receiver and blocks forever.
		_, err := FirstResult(context.Background(), []Fetcher{
			fixed("a", 5*time.Millisecond),
			fixed("b", 6*time.Millisecond),
			fixed("c", 7*time.Millisecond),
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	if after := waitForGoroutines(before, 2*time.Second); after > before {
		t.Fatalf("goroutines: before=%d after=%d — FirstResult leaks goroutines", before, after)
	}
}

func TestLosersAreCancelled(t *testing.T) {
	var cancelled atomic.Bool
	slow := func(ctx context.Context) (string, error) {
		select {
		case <-time.After(5 * time.Second):
			return "too late", nil
		case <-ctx.Done():
			cancelled.Store(true)
			return "", ctx.Err()
		}
	}
	if _, err := FirstResult(context.Background(), []Fetcher{slow, fixed("fast", 5*time.Millisecond)}); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	deadline := time.Now().Add(time.Second)
	for !cancelled.Load() && time.Now().Before(deadline) {
		time.Sleep(5 * time.Millisecond)
	}
	if !cancelled.Load() {
		t.Fatal("slow fetcher never saw ctx.Done() after FirstResult returned")
	}
}

func TestAllFailReturnsQuickly(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	start := time.Now()
	_, err := FirstResult(ctx, []Fetcher{failing(10 * time.Millisecond), failing(20 * time.Millisecond)})
	if !errors.Is(err, ErrAllFailed) {
		t.Fatalf("err = %v; want errors.Is(err, ErrAllFailed)", err)
	}
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Fatalf("took %v: FirstResult waited for ctx instead of noticing every fetcher failed", elapsed)
	}
}

func TestNoFetchers(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	if _, err := FirstResult(ctx, nil); !errors.Is(err, ErrAllFailed) {
		t.Fatalf("FirstResult(nil) err = %v; want ErrAllFailed", err)
	}
}

func TestParentCancellation(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	_, err := FirstResult(ctx, []Fetcher{fixed("never", 5*time.Second)})
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("err = %v; want context.DeadlineExceeded", err)
	}
}
