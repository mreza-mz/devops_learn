package lab

import (
	"context"
	"time"
)

func CallWithTimeout(parent context.Context, d time.Duration, fn func(ctx context.Context) (int, error)) (int, error) {
	ctx, cancel := context.WithTimeout(parent, d)
	defer cancel()

	type result struct {
		v   int
		err error
	}
	done := make(chan result, 1) // buffered: the worker can always finish its send
	go func() {
		v, err := fn(ctx)
		done <- result{v, err}
	}()

	select {
	case r := <-done:
		return r.v, r.err
	case <-ctx.Done():
		return 0, ctx.Err()
	}
}
