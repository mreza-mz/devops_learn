package lab

import (
	"errors"
	"fmt"
	"net/http"
	"time"
)

// ErrNotFound is returned by the store when a user does not exist.
var ErrNotFound = errors.New("not found")

// RateLimitError is returned when a downstream dependency throttles us.
type RateLimitError struct {
	RetryAfter time.Duration
}

func (e *RateLimitError) Error() string {
	return fmt.Sprintf("rate limited, retry after %s", e.RetryAfter)
}

func find(store map[int]string, id int) (string, error) {
	if v, ok := store[id]; ok {
		return v, nil
	}
	return "", ErrNotFound
}

// GetUserName returns the user's name. On failure the error message must start
// with "get user <id>: " AND the error must still match errors.Is(err, ErrNotFound).
func GetUserName(store map[int]string, id int) (string, error) {
	name, err := find(store, id)
	if err != nil {
		// BUG: the cause is flattened into a string; callers lose ErrNotFound.
		return "", fmt.Errorf("get user %d: %v", id, err)
	}
	return name, nil
}

// StatusCode maps an error (possibly wrapped several times) to an HTTP status:
//
//	nil                → 200
//	ErrNotFound        → 404
//	*RateLimitError    → 429
//	anything else      → 500
func StatusCode(err error) int {
	// TODO: implement using errors.Is and errors.As — never compare strings.
	if err == nil {
		return http.StatusOK
	}
	return http.StatusInternalServerError
}
