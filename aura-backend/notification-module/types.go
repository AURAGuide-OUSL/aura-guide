package notification

import "time"

type Response struct {
	Message string    `json:"message"`
	Date    time.Time `json:"date"`
}

type Item struct {
	ID      int    `json:"id"`
	Title   string `json:"title"`
	Message string `json:"message"`
	Type    string `json:"type"`
	Time    string `json:"time"`
	Read    bool   `json:"read"`
}
