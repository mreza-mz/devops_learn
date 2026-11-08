package lab

import (
	"errors"
	"testing"
)

func TestValidUserReturnsNilError(t *testing.T) {
	if err := Validate(User{Name: "Sara", Email: "sara@example.com"}); err != nil {
		t.Fatalf("Validate(valid user) = %#v; want nil.\n"+
			"Hint: an interface holding a nil *ValidationError is not a nil interface.", err)
	}
}

func TestInvalidUserReturnsValidationError(t *testing.T) {
	cases := []struct {
		name  string
		user  User
		field string
	}{
		{"missing name", User{Email: "a@b.c"}, "name"},
		{"missing email", User{Name: "Ali"}, "email"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := Validate(tc.user)
			var ve *ValidationError
			if !errors.As(err, &ve) {
				t.Fatalf("Validate(%+v) = %v; want *ValidationError", tc.user, err)
			}
			if ve.Field != tc.field {
				t.Fatalf("Field = %q; want %q", ve.Field, tc.field)
			}
		})
	}
}
