package lab

import "cmp"

type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }

func (s *Stack[T]) Pop() (v T, ok bool) {
	if len(s.items) == 0 {
		return v, false
	}
	last := len(s.items) - 1
	v = s.items[last]
	var zero T
	s.items[last] = zero // drop the reference so the GC can reclaim it
	s.items = s.items[:last]
	return v, true
}

func (s *Stack[T]) Peek() (v T, ok bool) {
	if len(s.items) == 0 {
		return v, false
	}
	return s.items[len(s.items)-1], true
}

func (s *Stack[T]) Len() int { return len(s.items) }

func MaxOf[T cmp.Ordered](xs ...T) (max T, ok bool) {
	if len(xs) == 0 {
		return max, false
	}
	max = xs[0]
	for _, x := range xs[1:] {
		if x > max {
			max = x
		}
	}
	return max, true
}
