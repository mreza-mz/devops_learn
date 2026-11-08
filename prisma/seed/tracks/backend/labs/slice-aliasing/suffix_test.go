package lab

import "testing"

func TestWithSuffixResultsAreIndependent(t *testing.T) {
	base := make([]string, 2, 10) // spare capacity: the trap
	base[0], base[1] = "a", "b"

	x := WithSuffix(base, "x")
	y := WithSuffix(base, "y")

	if len(x) != 3 || x[2] != "x" {
		t.Fatalf("first result = %v, want [a b x]", x)
	}
	if len(y) != 3 || y[2] != "y" {
		t.Fatalf("second result = %v, want [a b y]", y)
	}
	if x[2] != "x" {
		t.Fatalf("second call overwrote the first result: x = %v", x)
	}
}

func TestWithSuffixDoesNotShareBackingArray(t *testing.T) {
	base := make([]string, 1, 4)
	base[0] = "orig"

	out := WithSuffix(base, "z")
	out[0] = "changed"

	if base[0] != "orig" {
		t.Fatalf("writing to the result changed base: base[0] = %q", base[0])
	}
}

func TestWithSuffixNilBase(t *testing.T) {
	out := WithSuffix(nil, "only")
	if len(out) != 1 || out[0] != "only" {
		t.Fatalf("WithSuffix(nil, \"only\") = %v", out)
	}
}

func TestHeadCopiesAndDoesNotRetainBuffer(t *testing.T) {
	buf := make([]byte, 1<<20)
	copy(buf, "hello world")

	h := Head(buf, 5)
	if string(h) != "hello" {
		t.Fatalf("Head = %q, want %q", h, "hello")
	}
	if cap(h) > 64 {
		t.Fatalf("cap(Head(...)) = %d: the result still references the 1MB buffer", cap(h))
	}
	buf[0] = 'J'
	if h[0] != 'h' {
		t.Fatalf("result changed when buf changed: shares memory with buf")
	}
}

func TestHeadShortBuffer(t *testing.T) {
	if got := Head([]byte("hi"), 10); string(got) != "hi" {
		t.Fatalf("Head(\"hi\", 10) = %q", got)
	}
}
