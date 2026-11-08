package lab

import (
	"testing"
	"unicode/utf8"
)

func TestReverseASCII(t *testing.T) {
	cases := []struct{ in, want string }{
		{"", ""},
		{"a", "a"},
		{"golang", "gnalog"},
		{"Hello, world", "dlrow ,olleH"},
	}
	for _, tc := range cases {
		if got := Reverse(tc.in); got != tc.want {
			t.Errorf("Reverse(%q) = %q; want %q", tc.in, got, tc.want)
		}
	}
}

func TestReversePersian(t *testing.T) {
	if got, want := Reverse("سلام"), "مالس"; got != want {
		t.Fatalf("Reverse(%q) = %q; want %q", "سلام", got, want)
	}
}

// FuzzReverse checks properties instead of fixed examples:
// reversing twice gives the original, and valid UTF-8 stays valid.
func FuzzReverse(f *testing.F) {
	for _, seed := range []string{"Hello", " ", "!12345", "داده"} {
		f.Add(seed)
	}
	f.Fuzz(func(t *testing.T, orig string) {
		if !utf8.ValidString(orig) {
			t.Skip("only valid UTF-8 input is in scope")
		}
		rev := Reverse(orig)
		if !utf8.ValidString(rev) {
			t.Fatalf("Reverse produced invalid UTF-8: %q", rev)
		}
		if again := Reverse(rev); again != orig {
			t.Fatalf("Reverse(Reverse(%q)) = %q", orig, again)
		}
		if utf8.RuneCountInString(rev) != utf8.RuneCountInString(orig) {
			t.Fatalf("rune count changed: %q -> %q", orig, rev)
		}
	})
}
