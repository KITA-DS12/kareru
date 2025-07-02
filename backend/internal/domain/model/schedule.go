package model

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
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

// GenerateUUID generates a new UUID v4
func GenerateUUID() (string, error) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	// UUID v4 format
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%12x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}

// GenerateEditToken generates a secure random token for editing
func GenerateEditToken() (string, error) {
	b := make([]byte, 32) // 256 bits
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// VerifyEditToken verifies if the provided token matches the schedule's edit token
func (s *Schedule) VerifyEditToken(token string) error {
	if token == "" || s.EditToken != token {
		return errors.New("invalid edit token")
	}
	return nil
}

// Validate validates the time slot
func (ts *TimeSlot) Validate() error {
	if !ts.StartTime.Before(ts.EndTime) {
		return errors.New("start time must be before end time")
	}
	return nil
}

// ValidateTimeSlots validates all time slots in the schedule
func (s *Schedule) ValidateTimeSlots() error {
	// First validate each slot individually
	for _, slot := range s.TimeSlots {
		if err := slot.Validate(); err != nil {
			return err
		}
	}

	// Check for overlaps
	for i := 0; i < len(s.TimeSlots); i++ {
		for j := i + 1; j < len(s.TimeSlots); j++ {
			if s.TimeSlots[i].overlaps(s.TimeSlots[j]) {
				return errors.New("time slots overlap")
			}
		}
	}

	return nil
}

// overlaps checks if two time slots overlap
func (ts *TimeSlot) overlaps(other TimeSlot) bool {
	// Two slots overlap if one starts before the other ends
	return ts.StartTime.Before(other.EndTime) && other.StartTime.Before(ts.EndTime)
}

// IsExpired checks if the schedule has expired (7 days after creation)
func (s *Schedule) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// NewSchedule creates a new schedule with generated ID and edit token
func NewSchedule() (*Schedule, error) {
	id, err := GenerateUUID()
	if err != nil {
		return nil, err
	}

	token, err := GenerateEditToken()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	return &Schedule{
		ID:        id,
		EditToken: token,
		CreatedAt: now,
		ExpiresAt: now.Add(7 * 24 * time.Hour),
		TimeSlots: []TimeSlot{},
	}, nil
}