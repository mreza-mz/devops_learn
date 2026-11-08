package lab

import "cmp"

// Stack is a LIFO stack. Its zero value must be ready to use:
//
//	var s Stack[int]
//	s.Push(1)
type Stack[T any] struct {
	// TODO: choose the fields.
}

// Push adds v on top of the stack.
func (s *Stack[T]) Push(v T) {
	// TODO
}

// Pop removes and returns the top element. ok is false when the stack is empty.
func (s *Stack[T]) Pop() (v T, ok bool) {
	// TODO
	return v, false
}

// Peek returns the top element without removing it.
func (s *Stack[T]) Peek() (v T, ok bool) {
	// TODO
	return v, false
}

// Len returns the number of elements.
func (s *Stack[T]) Len() int {
	// TODO
	return 0
}

// MaxOf returns the largest value in xs. ok is false when xs is empty.
func MaxOf[T cmp.Ordered](xs ...T) (max T, ok bool) {
	// TODO
	return max, false
}
