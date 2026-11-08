package lab

import (
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"
)

func TestGetUserNameKeepsCause(t *testing.T) {
	_, err := GetUserName(map[int]string{1: "Reza"}, 42)
	if err == nil {
		t.Fatal("expected an error for a missing user")
	}
	if !strings.HasPrefix(err.Error(), "get user 42: ") {
		t.Fatalf("error message = %q; want prefix %q", err, "get user 42: ")
	}
	if !errors.Is(err, ErrNotFound) {
		t.Fatalf("errors.Is(err, ErrNotFound) = false; the cause was lost (use %%w)")
	}
}

func TestGetUserNameFound(t *testing.T) {
	name, err := GetUserName(map[int]string{1: "Reza"}, 1)
	if err != nil || name != "Reza" {
		t.Fatalf("GetUserName = (%q, %v); want (\"Reza\", nil)", name, err)
	}
}

func TestStatusCode(t *testing.T) {
	rl := &RateLimitError{RetryAfter: time.Second}
	cases := []struct {
		name string
		err  error
		want int
	}{
		{"nil", nil, 200},
		{"not found", ErrNotFound, 404},
		{"wrapped not found", fmt.Errorf("handler: %w", fmt.Errorf("service: %w", ErrNotFound)), 404},
		{"rate limited", rl, 429},
		{"wrapped rate limited", fmt.Errorf("call billing: %w", rl), 429},
		{"joined", errors.Join(errors.New("other"), ErrNotFound), 404},
		{"unknown", errors.New("boom"), 500},
		{"message mentions not found", errors.New("user not found in cache"), 500},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := StatusCode(tc.err); got != tc.want {
				t.Fatalf("StatusCode(%v) = %d; want %d", tc.err, got, tc.want)
			}
		})
	}
}
