package dao

import (
	"sort"
	"sync"

	calendar "aura-backend/calendar-module"
)

var (
	eventMu     sync.RWMutex
	eventStore  = map[string][]calendar.Event{}
	nextEventID = 1
)

func GetEvents(email string) []calendar.Event {
	eventMu.RLock()
	events := append([]calendar.Event(nil), eventStore[email]...)
	eventMu.RUnlock()
	sort.Slice(events, func(i, j int) bool {
		return events[i].StartTime.Before(events[j].StartTime)
	})
	return events
}

func AddEvent(email string, req calendar.AddEventRequest) *calendar.Event {
	eventMu.Lock()
	defer eventMu.Unlock()

	event := calendar.Event{
		ID:          nextEventID,
		Title:       req.Title,
		Description: req.Description,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
	}
	nextEventID++
	eventStore[email] = append(eventStore[email], event)
	return &event
}
