package lab

import (
	"maps"
	"sync"
)

// Stats is safe for concurrent use. The mutex is an unexported field, not
// embedded, so Lock/Unlock do not leak into the public API.
type Stats struct {
	mu     sync.RWMutex
	counts map[string]int
	total  int
}

func NewStats() *Stats {
	return &Stats{counts: make(map[string]int)}
}

func (s *Stats) Inc(path string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.counts[path]++
	s.total++
}

func (s *Stats) Get(path string) int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.counts[path]
}

func (s *Stats) Total() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.total
}

func (s *Stats) Snapshot() map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return maps.Clone(s.counts)
}
