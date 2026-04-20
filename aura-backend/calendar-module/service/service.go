package service

import (
	"fmt"

	calendar "aura-backend/calendar-module"
	"aura-backend/calendar-module/dao"
)

func GetEvents(email string) []calendar.Event {
	return dao.GetEvents(email)
}

func AddEvent(email string, req calendar.AddEventRequest) (*calendar.Event, error) {
	if req.Title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if req.EndTime.Before(req.StartTime) {
		return nil, fmt.Errorf("end_time must be after start_time")
	}
	return dao.AddEvent(email, req), nil
}
