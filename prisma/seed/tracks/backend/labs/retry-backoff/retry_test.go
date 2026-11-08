package lab

import (
	"context"
	"errors"
	"testing"
	"time"
)

type recorder struct{ delays []time.Duration }

func (r *recorder) sleep(ctx context.Context, d time.Duration) error {
	r.delays = append(r.delays, d)
	return ctx.Err()
}

func policy(r *recorder, attempts int, jitter float64) Policy {
	return Policy{
		Attempts: attempts,
		Base:     100 * time.Millisecond,
		Max:      time.Second,
		Sleep:    r.sleep,
		Rand:     func() float64 { return jitter },
	}
}

var errTemporary = errors.New("503 service unavailable")

func TestSucceedsAfterRetries(t *testing.T) {
	var r recorder
	calls := 0
	err := Retry(context.Background(), policy(&r, 5, 1), func(context.Context) error {
		calls++
		if calls < 3 {
			return errTemporary
		}
		return nil
	})
	if err != nil {
		t.Fatalf("err = %v; want nil", err)
	}
	if calls != 3 {
		t.Fatalf("calls = %d; want 3", calls)
	}
	if len(r.delays) != 2 {
		t.Fatalf("slept %d times; want 2 (between the 3 calls)", len(r.delays))
	}
}

func TestExponentialBackoffWithCap(t *testing.T) {
	var r recorder
	_ = Retry(context.Background(), policy(&r, 6, 1), func(context.Context) error { return errTemporary })

	want := []time.Duration{100, 200, 400, 800, 1000} // ms; capped at Max=1s
	if len(r.delays) != len(want) {
		t.Fatalf("delays = %v; want %d sleeps", r.delays, len(want))
	}
	for i, w := range want {
		if r.delays[i] != w*time.Millisecond {
			t.Fatalf("delay[%d] = %v; want %v (all delays: %v)", i, r.delays[i], w*time.Millisecond, r.delays)
		}
	}
}

func TestFullJitter(t *testing.T) {
	var r recorder
	_ = Retry(context.Background(), policy(&r, 3, 0.5), func(context.Context) error { return errTemporary })
	if len(r.delays) != 2 || r.delays[0] != 50*time.Millisecond || r.delays[1] != 100*time.Millisecond {
		t.Fatalf("delays with Rand()=0.5 = %v; want [50ms 100ms]", r.delays)
	}
}

func TestReturnsLastErrorWhenExhausted(t *testing.T) {
	var r recorder
	calls := 0
	err := Retry(context.Background(), policy(&r, 3, 1), func(context.Context) error {
		calls++
		return errTemporary
	})
	if calls != 3 {
		t.Fatalf("calls = %d; want Attempts=3", calls)
	}
	if !errors.Is(err, errTemporary) {
		t.Fatalf("err = %v; want the last error", err)
	}
}

func TestPermanentStopsImmediately(t *testing.T) {
	var r recorder
	invalid := errors.New("400 invalid card number")
	calls := 0
	err := Retry(context.Background(), policy(&r, 5, 1), func(context.Context) error {
		calls++
		return Permanent(invalid)
	})
	if calls != 1 {
		t.Fatalf("calls = %d; a permanent error must not be retried", calls)
	}
	if err != invalid {
		t.Fatalf("err = %#v; want the unwrapped error itself", err)
	}
}

func TestStopsWhenContextCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	var r recorder
	calls := 0
	err := Retry(ctx, policy(&r, 10, 1), func(context.Context) error {
		calls++
		if calls == 2 {
			cancel()
		}
		return errTemporary
	})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v; want context.Canceled", err)
	}
	if calls != 2 {
		t.Fatalf("calls = %d; want 2 (stop right after cancellation)", calls)
	}
}

func TestDefaultsUseRealSleep(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	calls := 0
	start := time.Now()
	err := Retry(ctx, Policy{Attempts: 3, Base: 5 * time.Millisecond, Max: 20 * time.Millisecond}, func(context.Context) error {
		calls++
		return errTemporary
	})
	if calls != 3 || !errors.Is(err, errTemporary) {
		t.Fatalf("calls=%d err=%v with default Sleep/Rand", calls, err)
	}
	if time.Since(start) > time.Second {
		t.Fatal("default sleep waited far too long")
	}
}
