package lab

import (
	"context"
	"net/http"
)

// RequestIDHeader is read from incoming requests and echoed in responses.
const RequestIDHeader = "X-Request-ID"

// RequestID makes sure every request has an ID:
//   - reuse the incoming X-Request-ID if present and at most 64 characters;
//   - otherwise generate a new random ID (e.g. 16 bytes from crypto/rand, hex);
//   - store it in the request context (RequestIDFrom must return it) and set
//     it on the response header BEFORE calling next.
func RequestID(next http.Handler) http.Handler {
	// TODO
	return next
}

// RequestIDFrom returns the ID stored by RequestID, or "" if there is none.
func RequestIDFrom(ctx context.Context) string {
	// TODO: use an unexported key type, never a plain string key.
	return ""
}

// Recoverer turns a panic in next into a 500 response with the JSON body
// {"error":"internal"} so one bad request cannot kill the process.
// It must re-panic http.ErrAbortHandler: net/http uses that sentinel on purpose
// to abort a response, and swallowing it hides the abort.
func Recoverer(next http.Handler) http.Handler {
	// TODO
	return next
}
