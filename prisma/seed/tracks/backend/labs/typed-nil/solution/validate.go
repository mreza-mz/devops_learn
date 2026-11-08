package lab

type ValidationError struct {
	Field string
}

func (e *ValidationError) Error() string { return "invalid field: " + e.Field }

type User struct {
	Name  string
	Email string
}

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
func Validate(u User) error {
	if ve := check(u); ve != nil {
		return ve
	}
	return nil
}
