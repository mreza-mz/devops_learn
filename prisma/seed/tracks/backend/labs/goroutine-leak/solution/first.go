package lab

import (
	"context"
	"errors"
	"fmt"
)

var ErrAllFailed = errors.New("all fetchers failed")

type Fetcher func(ctx context.Context) (string, error)

func FirstResult(ctx context.Context, fetchers []Fetcher) (string, error) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel() // tells the losers to stop

	type result struct {
		v   string
		err error
	}
	// Buffered for every sender: nobody blocks even after we have returned.
	results := make(chan result, len(fetchers))
	for _, f := range fetchers {
		go func(f Fetcher) {
			v, err := f(ctx)
			results <- result{v, err}
		}(f)
	}

	var errs []error
	for range fetchers {
		select {
		case r := <-results:
			if r.err == nil {
				return r.v, nil
			}
			errs = append(errs, r.err)
		case <-ctx.Done():
			return "", ctx.Err()
		}
	}
	return "", fmt.Errorf("%w: %w", ErrAllFailed, errors.Join(errs...))
}
