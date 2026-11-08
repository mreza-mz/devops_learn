package lab

import (
	"errors"
	"fmt"
	"net/http"
	"time"
)

var ErrNotFound = errors.New("not found")

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

func GetUserName(store map[int]string, id int) (string, error) {
	name, err := find(store, id)
	if err != nil {
		return "", fmt.Errorf("get user %d: %w", id, err)
	}
	return name, nil
}

func StatusCode(err error) int {
	var rl *RateLimitError
	switch {
	case err == nil:
		return http.StatusOK
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	case errors.As(err, &rl):
		return http.StatusTooManyRequests
	default:
		return http.StatusInternalServerError
	}
}
