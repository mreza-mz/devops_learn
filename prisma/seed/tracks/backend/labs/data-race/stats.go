package lab

// Stats counts requests per path. Every HTTP handler goroutine calls Inc,
// and a metrics exporter goroutine calls Snapshot every few seconds.
//
// It works in unit tests, but in production it occasionally crashes with
// "fatal error: concurrent map writes" and the totals look wrong.
// Run: go test -race
type Stats struct {
	counts map[string]int
	total  int
}

func NewStats() *Stats {
	return &Stats{counts: make(map[string]int)}
}

func (s *Stats) Inc(path string) {
	s.counts[path]++
	s.total++
}

func (s *Stats) Get(path string) int {
	return s.counts[path]
}

func (s *Stats) Total() int {
	return s.total
}

// Snapshot returns a copy that the caller may read and modify freely.
func (s *Stats) Snapshot() map[string]int {
	return s.counts
}
