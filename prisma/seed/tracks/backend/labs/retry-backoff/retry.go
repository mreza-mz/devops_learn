package lab

import (
	"context"
	"time"
)

// Policy configures Retry. Sleep and Rand are injectable for tests;
// nil means "use the real clock" and "use math/rand/v2".
type Policy struct {
	Attempts int           // total calls including the first one (>= 1)
	Base     time.Duration // delay cap before attempt 2 is Base, then 2*Base, 4*Base...
	Max      time.Duration // the cap never exceeds Max
	Sleep    func(ctx context.Context, d time.Duration) error
	Rand     func() float64 // returns a value in [0, 1]
}

type permanentError struct{ err error }

func (p *permanentError) Error() string { return p.err.Error() }
func (p *permanentError) Unwrap() error { return p.err }

// Permanent marks err as not worth retrying (e.g. 400 Bad Request, invalid card).
func Permanent(err error) error { return &permanentError{err: err} }

// Retry calls fn until it succeeds, up to p.Attempts calls.
//
// Requirements:
//   - before retry number i (i = 0 for the first retry) wait
//     Rand() * min(Max, Base * 2^i)        // exponential backoff + full jitter
//   - a Permanent error stops immediately; return the error INSIDE it;
//   - if ctx is cancelled (or Sleep returns an error) stop and return ctx.Err();
//   - when attempts run out, return the last error from fn.
func Retry(ctx context.Context, p Policy, fn func(ctx context.Context) error) error {
	// TODO: today there is no retry at all.
	return fn(ctx)
}
