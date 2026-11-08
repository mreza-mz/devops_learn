package lab

import "container/list"

type entry[K comparable, V any] struct {
	key K
	val V
}

type Cache[K comparable, V any] struct {
	cap   int
	order *list.List // front = most recently used
	items map[K]*list.Element
}

func New[K comparable, V any](capacity int) *Cache[K, V] {
	if capacity < 1 {
		capacity = 1
	}
	return &Cache[K, V]{cap: capacity, order: list.New(), items: make(map[K]*list.Element, capacity)}
}

func (c *Cache[K, V]) Get(k K) (v V, ok bool) {
	el, ok := c.items[k]
	if !ok {
		return v, false
	}
	c.order.MoveToFront(el)
	return el.Value.(*entry[K, V]).val, true
}

func (c *Cache[K, V]) Put(k K, v V) {
	if el, ok := c.items[k]; ok {
		el.Value.(*entry[K, V]).val = v
		c.order.MoveToFront(el)
		return
	}
	if c.order.Len() >= c.cap {
		oldest := c.order.Back()
		c.order.Remove(oldest)
		delete(c.items, oldest.Value.(*entry[K, V]).key)
	}
	c.items[k] = c.order.PushFront(&entry[K, V]{key: k, val: v})
}

func (c *Cache[K, V]) Len() int { return c.order.Len() }
