package model

import (
	"time"
)

type Schedule struct {
	ID           string
	EditToken    string
	TimeSlots    []TimeSlot
	Comment      string
	CreatedAt    time.Time
	ExpiresAt    time.Time
}

type TimeSlot struct {
	StartTime time.Time
	EndTime   time.Time
	Available bool
}