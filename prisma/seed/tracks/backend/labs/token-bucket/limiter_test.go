package lab

import (
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

type fakeClock struct {
	mu sync.Mutex
	t  time.Time
}

func (c *fakeClock) Now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.t
}

func (c *fakeClock) Advance(d time.Duration) {
	c.mu.Lock()
	c.t = c.t.Add(d)
	c.mu.Unlock()
}

func newClock() *fakeClock { return &fakeClock{t: time.Unix(1_700_000_000, 0)} }

func allowN(l *Limiter, n int) int {
	ok := 0
	for i := 0; i < n; i++ {
		if l.Allow() {
			ok++
		}
	}
	return ok
}

func TestStartsFullAndEmpties(t *testing.T) {
	clk := newClock()
	l := NewLimiter(1, 5, clk.Now)
	if got := allowN(l, 10); got != 5 {
		t.Fatalf("allowed %d of 10 immediately; want burst=5", got)
	}
}

func TestContinuousRefill(t *testing.T) {
	clk := newClock()
	l := NewLimiter(2, 3, clk.Now) // 2 tokens/sec
	allowN(l, 3)                   // drain

	clk.Advance(250 * time.Millisecond)
	if l.Allow() {
		t.Fatal("after 250ms at 2/s only half a token is back; Allow must be false")
	}
	clk.Advance(250 * time.Millisecond)
	if !l.Allow() {
		t.Fatal("after 500ms at 2/s one token is back; Allow must be true")
	}
	if l.Allow() {
		t.Fatal("that token was just used; Allow must be false")
	}
}

func TestNeverExceedsBurst(t *testing.T) {
	clk := newClock()
	l := NewLimiter(10, 4, clk.Now)
	allowN(l, 4)
	clk.Advance(time.Hour)
	if got := allowN(l, 100); got != 4 {
		t.Fatalf("after a long idle period %d requests passed; want burst=4", got)
	}
}

func TestConcurrentAllow(t *testing.T) {
	clk := newClock()
	l := NewLimiter(1, 50, clk.Now)
	var passed atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 10; j++ {
				if l.Allow() {
					passed.Add(1)
				}
			}
		}()
	}
	wg.Wait()
	if p := passed.Load(); p != 50 {
		t.Fatalf("%d of 200 concurrent requests passed; want exactly 50", p)
	}
}
