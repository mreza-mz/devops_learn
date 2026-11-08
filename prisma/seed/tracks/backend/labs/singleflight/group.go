package lab

// Group de-duplicates concurrent calls that share a key.
//
// Use case: 500 requests miss the cache for the same hot product at the same
// moment. Without Group, all 500 hit the database (cache stampede). With Group,
// one call runs and the other 499 wait for its result.
//
// Requirements (tests run with -race):
//   - while a call for key is in flight, other Do calls for that key wait and
//     receive the SAME value and error; fn runs once per flight;
//   - shared is true for callers that received a result they did not compute;
//   - different keys do not block each other;
//   - nothing is cached: once a flight finishes, the next Do runs fn again;
//   - the zero value of Group is ready to use.
type Group struct {
	// TODO
}

func (g *Group) Do(key string, fn func() (any, error)) (v any, err error, shared bool) {
	// TODO: today every caller runs fn.
	v, err = fn()
	return v, err, false
}
