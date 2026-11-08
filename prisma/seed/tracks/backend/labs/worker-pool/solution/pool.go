package lab

import (
	"context"
	"sync"
)

func Map[T, R any](ctx context.Context, items []T, workers int, fn func(context.Context, T) (R, error)) ([]R, error) {
	if workers < 1 {
		workers = 1
	}
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	out := make([]R, len(items)) // each index is written by exactly one goroutine
	jobs := make(chan int)

	var (
		wg       sync.WaitGroup
		once     sync.Once
		firstErr error
	)
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range jobs {
				r, err := fn(ctx, items[i])
				if err != nil {
					once.Do(func() {
						firstErr = err
						cancel()
					})
					continue
				}
				out[i] = r
			}
		}()
	}

feed:
	for i := range items {
		select {
		case jobs <- i:
		case <-ctx.Done():
			break feed
		}
	}
	close(jobs)
	wg.Wait()

	if firstErr != nil {
		return nil, firstErr
	}
	if err := ctx.Err(); err != nil { // the parent was cancelled
		return nil, err
	}
	return out, nil
}
