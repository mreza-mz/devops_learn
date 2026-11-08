package lab

import (
	"testing"
	"time"
)

func TestGetMissing(t *testing.T) {
	c := New[string, int](2)
	if _, ok := c.Get("x"); ok {
		t.Fatal("Get on empty cache returned ok=true")
	}
}

func TestEvictsLeastRecentlyUsed(t *testing.T) {
	c := New[string, int](2)
	c.Put("a", 1)
	c.Put("b", 2)
	c.Put("c", 3) // evicts a

	if _, ok := c.Get("a"); ok {
		t.Fatal("a should have been evicted")
	}
	if v, ok := c.Get("b"); !ok || v != 2 {
		t.Fatalf("Get(b) = (%d, %v)", v, ok)
	}
	if c.Len() != 2 {
		t.Fatalf("Len() = %d; want 2", c.Len())
	}
}

func TestGetRefreshesRecency(t *testing.T) {
	c := New[string, int](2)
	c.Put("a", 1)
	c.Put("b", 2)
	c.Get("a")    // a is now most recent
	c.Put("c", 3) // must evict b, not a

	if _, ok := c.Get("b"); ok {
		t.Fatal("b should have been evicted because a was read more recently")
	}
	if v, ok := c.Get("a"); !ok || v != 1 {
		t.Fatalf("Get(a) = (%d, %v); want (1, true)", v, ok)
	}
}

func TestPutUpdatesAndRefreshes(t *testing.T) {
	c := New[string, int](2)
	c.Put("a", 1)
	c.Put("b", 2)
	c.Put("a", 10) // update, now most recent
	c.Put("c", 3)  // evicts b

	if v, ok := c.Get("a"); !ok || v != 10 {
		t.Fatalf("Get(a) = (%d, %v); want (10, true)", v, ok)
	}
	if _, ok := c.Get("b"); ok {
		t.Fatal("b should have been evicted")
	}
	if c.Len() != 2 {
		t.Fatalf("Len() = %d; updating a key must not grow the cache", c.Len())
	}
}

func TestCapacityOne(t *testing.T) {
	c := New[int, string](1)
	c.Put(1, "one")
	c.Put(2, "two")
	if _, ok := c.Get(1); ok {
		t.Fatal("1 should have been evicted")
	}
	if v, _ := c.Get(2); v != "two" {
		t.Fatalf("Get(2) = %q", v)
	}
}

// A linear-time implementation (scanning a slice on every access) takes
// seconds here; an O(1) one takes a few milliseconds.
func TestOperationsAreConstantTime(t *testing.T) {
	const n = 20000
	c := New[int, int](n)
	start := time.Now()
	for i := 0; i < n; i++ {
		c.Put(i, i)
	}
	for i := 0; i < n; i++ {
		c.Get(i)
	}
	for i := n; i < 2*n; i++ {
		c.Put(i, i)
	}
	if elapsed := time.Since(start); elapsed > 2*time.Second {
		t.Fatalf("60k operations took %v; Get/Put are not O(1)", elapsed)
	}
	if c.Len() != n {
		t.Fatalf("Len() = %d; want %d", c.Len(), n)
	}
}
