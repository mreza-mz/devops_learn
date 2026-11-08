package lab

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func echoID(w http.ResponseWriter, r *http.Request) {
	_, _ = w.Write([]byte(RequestIDFrom(r.Context())))
}

func TestRequestIDGenerated(t *testing.T) {
	h := RequestID(http.HandlerFunc(echoID))
	ids := map[string]bool{}
	for i := 0; i < 3; i++ {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

		header := rec.Header().Get(RequestIDHeader)
		body := rec.Body.String()
		if header == "" {
			t.Fatal("response has no X-Request-ID header")
		}
		if body != header {
			t.Fatalf("ID in context = %q, ID in header = %q; they must match", body, header)
		}
		if len(header) < 16 {
			t.Fatalf("generated ID %q is too short to be unique", header)
		}
		ids[header] = true
	}
	if len(ids) != 3 {
		t.Fatal("generated IDs are not unique")
	}
}

func TestRequestIDReusesIncoming(t *testing.T) {
	h := RequestID(http.HandlerFunc(echoID))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set(RequestIDHeader, "edge-abc-123")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if got := rec.Header().Get(RequestIDHeader); got != "edge-abc-123" {
		t.Fatalf("header = %q; want the incoming ID", got)
	}
	if rec.Body.String() != "edge-abc-123" {
		t.Fatalf("context ID = %q; want the incoming ID", rec.Body.String())
	}
}

func TestRequestIDRejectsOversizedIncoming(t *testing.T) {
	h := RequestID(http.HandlerFunc(echoID))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set(RequestIDHeader, strings.Repeat("x", 500))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if got := rec.Header().Get(RequestIDHeader); len(got) > 64 || got == "" {
		t.Fatalf("an oversized client ID must be replaced, got len=%d", len(got))
	}
}

func TestRequestIDFromEmptyContext(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	if got := RequestIDFrom(req.Context()); got != "" {
		t.Fatalf("RequestIDFrom(empty) = %q", got)
	}
}

func TestRecovererReturns500(t *testing.T) {
	h := Recoverer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		var m map[string]int
		m["boom"] = 1 // nil map write: panics
	}))
	rec := httptest.NewRecorder()

	func() {
		defer func() {
			if r := recover(); r != nil {
				t.Fatalf("panic escaped the middleware: %v", r)
			}
		}()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	}()

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d; want 500", rec.Code)
	}
	var body map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil || body["error"] != "internal" {
		t.Fatalf("body = %q; want {\"error\":\"internal\"}", rec.Body.String())
	}
	if ct := rec.Header().Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
		t.Fatalf("Content-Type = %q; want application/json", ct)
	}
}

func TestRecovererPassesThrough(t *testing.T) {
	h := Recoverer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusTeapot)
	}))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	if rec.Code != http.StatusTeapot {
		t.Fatalf("status = %d; normal responses must pass through", rec.Code)
	}
}

func TestRecovererKeepsErrAbortHandler(t *testing.T) {
	h := Recoverer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic(http.ErrAbortHandler)
	}))
	defer func() {
		if r := recover(); r != http.ErrAbortHandler {
			t.Fatalf("recovered %v; http.ErrAbortHandler must be re-panicked", r)
		}
	}()
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/", nil))
	t.Fatal("http.ErrAbortHandler was swallowed")
}
