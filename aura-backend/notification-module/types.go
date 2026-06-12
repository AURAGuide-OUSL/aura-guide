package notification

import "time"

type Response struct {
	Message string    `json:"message"`
	Date    time.Time `json:"date"`
}
