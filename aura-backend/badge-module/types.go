package badge

import "time"

type Badge struct {
	Name       string    `json:"name"`
	Criteria   string    `json:"criteria"`
	IssuedDate time.Time `json:"issued_date"`
}
