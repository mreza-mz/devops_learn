package lab

import "testing"

func TestZeroValueStackIsUsable(t *testing.T) {
	var s Stack[string]
	if s.Len() != 0 {
		t.Fatalf("Len() of empty stack = %d", s.Len())
	}
	if _, ok := s.Pop(); ok {
		t.Fatal("Pop on empty stack returned ok=true")
	}
	if _, ok := s.Peek(); ok {
		t.Fatal("Peek on empty stack returned ok=true")
	}
}

func TestLIFOOrder(t *testing.T) {
	var s Stack[int]
	for i := 1; i <= 3; i++ {
		s.Push(i)
	}
	if top, ok := s.Peek(); !ok || top != 3 {
		t.Fatalf("Peek() = (%d, %v); want (3, true)", top, ok)
	}
	if s.Len() != 3 {
		t.Fatalf("Peek must not remove: Len() = %d; want 3", s.Len())
	}
	for want := 3; want >= 1; want-- {
		got, ok := s.Pop()
		if !ok || got != want {
			t.Fatalf("Pop() = (%d, %v); want (%d, true)", got, ok, want)
		}
	}
	if s.Len() != 0 {
		t.Fatalf("Len() after popping everything = %d", s.Len())
	}
}

func TestStackOfStructs(t *testing.T) {
	type job struct{ id int }
	var s Stack[*job]
	s.Push(&job{id: 7})
	j, ok := s.Pop()
	if !ok || j.id != 7 {
		t.Fatalf("Pop() = (%v, %v)", j, ok)
	}
}

func TestMaxOf(t *testing.T) {
	if m, ok := MaxOf(3, 9, -2, 9, 4); !ok || m != 9 {
		t.Fatalf("MaxOf ints = (%d, %v); want (9, true)", m, ok)
	}
	if m, ok := MaxOf(-5, -1, -9); !ok || m != -1 {
		t.Fatalf("MaxOf negatives = (%d, %v); want (-1, true)", m, ok)
	}
	if m, ok := MaxOf("go", "rust", "c"); !ok || m != "rust" {
		t.Fatalf("MaxOf strings = (%q, %v); want (\"rust\", true)", m, ok)
	}
	if _, ok := MaxOf[float64](); ok {
		t.Fatal("MaxOf() with no values returned ok=true")
	}
}
