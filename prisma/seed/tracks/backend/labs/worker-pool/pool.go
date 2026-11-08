package lab

import (
	"context"
	"errors"
)

// Map applies fn to every item and returns the results in the SAME ORDER as items.
//
// Requirements (checked by the tests, run with -race):
//   - at most `workers` calls to fn run at the same time (workers < 1 means 1);
//   - the work really runs in parallel — up to `workers` at once;
//   - on the first error from fn: stop starting new items, cancel the ctx given
//     to in-flight calls, wait for them, and return that first error;
//   - if ctx is cancelled, stop and return ctx.Err();
//   - every goroutine started by Map has exited before Map returns.
//
// Do not use golang.org/x/sync/errgroup here — implement it with the standard
// library so you can explain every line in an interview.
func Map[T, R any](ctx context.Context, items []T, workers int, fn func(context.Context, T) (R, error)) ([]R, error) {
	// TODO
	return nil, errors.New("not implemented")
}
