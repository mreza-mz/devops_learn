package lab

import (
	"context"
	"time"
)

// CallWithTimeout runs fn with a context that expires after d (or earlier if
// parent is cancelled).
//
// Requirements:
//   - return fn's result if it finishes in time;
//   - return as soon as the deadline passes, EVEN IF fn ignores its ctx,
//     with an error matching errors.Is(err, context.DeadlineExceeded);
//   - if parent is cancelled first, return an error matching context.Canceled;
//   - never leave a goroutine blocked forever.
func CallWithTimeout(parent context.Context, d time.Duration, fn func(ctx context.Context) (int, error)) (int, error) {
	// TODO: this ignores d and waits for fn no matter how long it takes.
	return fn(parent)
}
