package lab

// Cache is a fixed-capacity LRU cache: when full, Put evicts the least
// recently used key. Both Get and Put must be O(1).
//
// This is one of the most common live-coding questions for Go backend roles.
// Hint: a map plus a doubly linked list (container/list or your own).
// Concurrency safety is NOT required here; say in the interview how you would add it.
type Cache[K comparable, V any] struct {
	// TODO
}

// New returns a cache that holds at most capacity entries (capacity >= 1).
func New[K comparable, V any](capacity int) *Cache[K, V] {
	return &Cache[K, V]{}
}

// Get returns the value for k and marks k as most recently used.
func (c *Cache[K, V]) Get(k K) (v V, ok bool) {
	// TODO
	return v, false
}

// Put inserts or updates k and marks it as most recently used.
func (c *Cache[K, V]) Put(k K, v V) {
	// TODO
}

// Len returns the number of entries.
func (c *Cache[K, V]) Len() int {
	// TODO
	return 0
}
