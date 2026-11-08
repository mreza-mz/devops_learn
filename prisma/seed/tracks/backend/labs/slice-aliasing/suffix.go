package lab

// WithSuffix returns a NEW slice containing base followed by s.
//
// The caller keeps using base (and every earlier result) after the call,
// so the returned slice must never share its backing array with base.
func WithSuffix(base []string, s string) []string {
	// BUG: when cap(base) > len(base), append writes into base's backing
	// array, so two calls with the same base overwrite each other.
	return append(base, s)
}

// Head returns a copy of the first n bytes of buf (or all of buf if shorter).
//
// buf can be a multi-megabyte network buffer. Keeping a reference to it
// after Head returns would keep the whole buffer alive in memory.
func Head(buf []byte, n int) []byte {
	if n > len(buf) {
		n = len(buf)
	}
	// BUG: this re-slices buf, so the result retains the whole array.
	return buf[:n]
}
