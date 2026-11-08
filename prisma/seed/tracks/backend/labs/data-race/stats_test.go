package lab

import (
	"fmt"
	"sync"
	"testing"
)

func TestConcurrentUse(t *testing.T) {
	s := NewStats()
	const workers, perWorker = 8, 500

	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func(w int) {
			defer wg.Done()
			for i := 0; i < perWorker; i++ {
				s.Inc(fmt.Sprintf("/api/%d", i%5))
				_ = s.Get("/api/0")
				_ = s.Total()
			}
		}(w)
	}
	// An exporter reading while the writers are busy.
	wg.Add(1)
	go func() {
		defer wg.Done()
		for i := 0; i < 50; i++ {
			for range s.Snapshot() {
			}
		}
	}()
	wg.Wait()

	if got, want := s.Total(), workers*perWorker; got != want {
		t.Fatalf("Total() = %d; want %d", got, want)
	}
	if got, want := s.Get("/api/0"), workers*perWorker/5; got != want {
		t.Fatalf("Get(/api/0) = %d; want %d", got, want)
	}
}

func TestSnapshotIsACopy(t *testing.T) {
	s := NewStats()
	s.Inc("/a")
	snap := s.Snapshot()
	snap["/a"] = 100
	snap["/b"] = 1
	if s.Get("/a") != 1 || s.Get("/b") != 0 {
		t.Fatal("modifying the snapshot changed the live stats")
	}
}
