package lab

import "time"

// Limiter is a token bucket: it holds at most `burst` tokens and refills
// continuously at `rate` tokens per second. Allow consumes one token.
//
// The clock is injected (now) so the limiter can be tested without sleeping —
// mention this in interviews: time is a dependency.
//
// Requirements (tests run with -race):
//   - a new limiter starts full (burst tokens);
//   - refill is continuous: at rate=2, after 500ms exactly one token is back;
//   - tokens never exceed burst, no matter how long it was idle;
//   - safe for concurrent use.
type Limiter struct {
	// TODO
}

func NewLimiter(rate float64, burst int, now func() time.Time) *Limiter {
	return &Limiter{}
}

// Allow reports whether a request may proceed now, consuming a token if so.
func (l *Limiter) Allow() bool {
	// TODO: today nothing is limited.
	return true
}
