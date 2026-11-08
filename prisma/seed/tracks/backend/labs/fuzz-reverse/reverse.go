package lab

// Reverse returns s with its characters in reverse order.
// It must work for any valid UTF-8 text, including Persian.
func Reverse(s string) string {
	// The existing table test in reverse_test.go passes...
	// but run the fuzzer before trusting it:
	//   go test -fuzz=FuzzReverse -fuzztime=20s
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}
