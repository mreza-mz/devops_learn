package lab

// ValidationError reports which field of a User is invalid.
type ValidationError struct {
	Field string
}

func (e *ValidationError) Error() string { return "invalid field: " + e.Field }

type User struct {
	Name  string
	Email string
}

// check is an internal helper and is correct as written.
func check(u User) *ValidationError {
	if u.Name == "" {
		return &ValidationError{Field: "name"}
	}
	if u.Email == "" {
		return &ValidationError{Field: "email"}
	}
	return nil
}

// Validate returns nil for a valid user and a *ValidationError otherwise.
//
// Callers write the usual `if err := Validate(u); err != nil { ... }`.
func Validate(u User) error {
	// BUG: in production every request is rejected, even valid ones.
	return check(u)
}
