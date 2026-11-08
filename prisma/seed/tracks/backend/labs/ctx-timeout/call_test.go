package lab

import (
	"context"
	"errors"
	"runtime"
	"testing"
	"time"
)

func TestFastCall(t *testing.T) {
	v, err := CallWithTimeout(context.Background(), time.Second, func(context.Context) (int, error) {
		return 42, nil
	})
	if v != 42 || err != nil {
		t.Fatalf("got (%d, %v); want (42, nil)", v, err)
	}
}

func TestErrorFromFn(t *testing.T) {
	boom := errors.New("boom")
	_, err := CallWithTimeout(context.Background(), time.Second, func(context.Context) (int, error) {
		return 0, boom
	})
	if !errors.Is(err, boom) {
		t.Fatalf("err = %v; want boom", err)
	}
}

func TestFnSeesDeadline(t *testing.T) {
	_, _ = CallWithTimeout(context.Background(), 50*time.Millisecond, func(ctx context.Context) (int, error) {
		if _, ok := ctx.Deadline(); !ok {
			t.Error("fn's ctx has no deadline")
		}
		return 0, nil
	})
}

func TestTimeoutEvenIfFnIgnoresCtx(t *testing.T) {
	start := time.Now()
	_, err := CallWithTimeout(context.Background(), 100*time.Millisecond, func(context.Context) (int, error) {
		time.Sleep(2 * time.Second) // a badly behaved dependency
		return 1, nil
	})
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("err = %v; want context.DeadlineExceeded", err)
	}
	if elapsed := time.Since(start); elapsed > 600*time.Millisecond {
		t.Fatalf("returned after %v; want ~100ms", elapsed)
	}
}

func TestParentCancelled(t *testing.T) {
	parent, cancel := context.WithCancel(context.Background())
	go func() {
		time.Sleep(30 * time.Millisecond)
		cancel()
	}()
	_, err := CallWithTimeout(parent, 5*time.Second, func(ctx context.Context) (int, error) {
		<-ctx.Done()
		return 0, ctx.Err()
	})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v; want context.Canceled", err)
	}
}

func TestNoLeakAfterTimeout(t *testing.T) {
	before := runtime.NumGoroutine()
	for i := 0; i < 10; i++ {
		_, _ = CallWithTimeout(context.Background(), 10*time.Millisecond, func(context.Context) (int, error) {
			time.Sleep(50 * time.Millisecond)
			return 1, nil
		})
	}
	deadline := time.Now().Add(2 * time.Second)
	for runtime.NumGoroutine() > before && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
	}
	if after := runtime.NumGoroutine(); after > before {
		t.Fatalf("goroutines before=%d after=%d: workers stay blocked after the caller left", before, after)
	}
}
