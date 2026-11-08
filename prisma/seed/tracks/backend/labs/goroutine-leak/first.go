package lab

import (
	"context"
	"errors"
)

// ErrAllFailed is returned when every fetcher fails.
var ErrAllFailed = errors.New("all fetchers failed")

// Fetcher queries one replica. Well-behaved fetchers stop when ctx is cancelled.
type Fetcher func(ctx context.Context) (string, error)

// FirstResult queries all replicas concurrently and returns the first success.
//
// Requirements (this is what the tests check):
//  1. return the first successful value as soon as it arrives;
//  2. if every fetcher fails, return quickly with an error that matches
//     errors.Is(err, ErrAllFailed) — do not wait for ctx to expire;
//  3. after FirstResult returns, the slower fetchers must see ctx cancelled;
//  4. no goroutine may stay blocked forever (no leaks).
func FirstResult(ctx context.Context, fetchers []Fetcher) (string, error) {
	ch := make(chan string)
	for _, f := range fetchers {
		go func(f Fetcher) {
			v, err := f(ctx)
			if err == nil {
				ch <- v // losers block here forever
			}
		}(f)
	}
	select {
	case v := <-ch:
		return v, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}
