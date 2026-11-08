package lab

import (
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestDeduplicatesConcurrentCalls(t *testing.T) {
	var g Group
	var calls atomic.Int32
	release := make(chan struct{})

	const n = 50
	var wg sync.WaitGroup
	var sharedCount atomic.Int32
	results := make([]any, n)
	for i := 0; i < n; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			v, err, shared := g.Do("product:42", func() (any, error) {
				calls.Add(1)
				<-release // hold the flight open until everybody has joined
				return "from-db", nil
			})
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if shared {
				sharedCount.Add(1)
			}
			results[i] = v
		}(i)
	}
	time.Sleep(100 * time.Millisecond) // let all goroutines join the flight
	close(release)
	wg.Wait()

	if c := calls.Load(); c != 1 {
		t.Fatalf("fn ran %d times; want 1", c)
	}
	for i, v := range results {
		if v != "from-db" {
			t.Fatalf("caller %d got %v", i, v)
		}
	}
	if sharedCount.Load() < n-1 {
		t.Fatalf("shared=true for %d callers; want at least %d", sharedCount.Load(), n-1)
	}
}

func TestErrorIsShared(t *testing.T) {
	var g Group
	boom := errors.New("db down")
	release := make(chan struct{})
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			_, err, _ := g.Do("k", func() (any, error) {
				<-release
				return nil, boom
			})
			if !errors.Is(err, boom) {
				t.Errorf("err = %v; want boom", err)
			}
		}()
	}
	time.Sleep(50 * time.Millisecond)
	close(release)
	wg.Wait()
}

func TestDifferentKeysRunIndependently(t *testing.T) {
	var g Group
	var calls atomic.Int32
	start := time.Now()
	var wg sync.WaitGroup
	for _, key := range []string{"a", "b", "c"} {
		wg.Add(1)
		go func(key string) {
			defer wg.Done()
			v, _, _ := g.Do(key, func() (any, error) {
				calls.Add(1)
				time.Sleep(100 * time.Millisecond)
				return key, nil
			})
			if v != key {
				t.Errorf("Do(%q) = %v", key, v)
			}
		}(key)
	}
	wg.Wait()
	if calls.Load() != 3 {
		t.Fatalf("calls = %d; want 3", calls.Load())
	}
	if elapsed := time.Since(start); elapsed > 250*time.Millisecond {
		t.Fatalf("different keys took %v: they are blocking each other", elapsed)
	}
}

func TestNoCachingAfterFlight(t *testing.T) {
	var g Group
	n := 0
	for i := 0; i < 3; i++ {
		v, _, shared := g.Do("k", func() (any, error) { n++; return n, nil })
		if shared {
			t.Fatal("sequential calls must not be marked shared")
		}
		if v != i+1 {
			t.Fatalf("call %d returned %v; results must not be cached", i, v)
		}
	}
}
