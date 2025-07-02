package model

import (
	"fmt"
	"time"
)

type TimeSlotManager struct{}

type ManagedTimeSlot struct {
	StartTime time.Time
	EndTime   time.Time
}

func NewTimeSlotManager() *TimeSlotManager {
	return &TimeSlotManager{}
}

func (tsm *TimeSlotManager) GenerateSlots(start, end time.Time, interval time.Duration) []ManagedTimeSlot {
	var slots []ManagedTimeSlot
	
	current := start
	for current.Before(end) {
		slotEnd := current.Add(interval)
		if slotEnd.After(end) {
			break
		}
		
		slots = append(slots, ManagedTimeSlot{
			StartTime: current,
			EndTime:   slotEnd,
		})
		
		current = slotEnd
	}
	
	return slots
}

func (mts ManagedTimeSlot) Format() string {
	return fmt.Sprintf("%02d:%02d-%02d:%02d",
		mts.StartTime.Hour(), mts.StartTime.Minute(),
		mts.EndTime.Hour(), mts.EndTime.Minute())
}