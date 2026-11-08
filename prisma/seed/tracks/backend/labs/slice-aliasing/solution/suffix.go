package lab

// WithSuffix returns a NEW slice containing base followed by s.
func WithSuffix(base []string, s string) []string {
	out := make([]string, len(base), len(base)+1)
	copy(out, base)
	return append(out, s)
}

// Head returns a copy of the first n bytes of buf (or all of buf if shorter).
func Head(buf []byte, n int) []byte {
	if n > len(buf) {
		n = len(buf)
	}
	out := make([]byte, n)
	copy(out, buf[:n])
	return out
}
