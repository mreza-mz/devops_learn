package lab

import (
	"context"
	"errors"
	"math/rand/v2"
	"time"
)

type Policy struct {
	Attempts int
	Base     time.Duration
	Max      time.Duration
	Sleep    func(ctx context.Context, d time.Duration) error
	Rand     func() float64
}

type permanentError struct{ err error }

func (p *permanentError) Error() string { return p.err.Error() }
func (p *permanentError) Unwrap() error { return p.err }

func Permanent(err error) error { return &permanentError{err: err} }

func sleepCtx(ctx context.Context, d time.Duration) error {
	t := time.NewTimer(d)
	defer t.Stop()
	select {
	case <-t.C:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

func Retry(ctx context.Context, p Policy, fn func(ctx context.Context) error) error {
	if p.Attempts < 1 {
		p.Attempts = 1
	}
	if p.Sleep == nil {
		p.Sleep = sleepCtx
	}
	if p.Rand == nil {
		p.Rand = rand.Float64
	}

	var err error
	for attempt := 0; attempt < p.Attempts; attempt++ {
		if attempt > 0 {
			ceiling := p.Base << (attempt - 1) // Base * 2^i
			if ceiling > p.Max || ceiling <= 0 { // <= 0 guards against overflow
				ceiling = p.Max
			}
			if serr := p.Sleep(ctx, time.Duration(p.Rand()*float64(ceiling))); serr != nil {
				return ctx.Err()
			}
		}
		if err = fn(ctx); err == nil {
			return nil
		}
		var perm *permanentError
		if errors.As(err, &perm) {
			return perm.err
		}
		if ctx.Err() != nil {
			return ctx.Err()
		}
	}
	return err
}
