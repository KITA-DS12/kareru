package model

import (
	"fmt"
	"time"
)

type TimeSlotManager struct {
	businessHours BusinessHours
}

type ManagedTimeSlot struct {
	StartTime time.Time
	EndTime   time.Time
}

type BusinessHours struct {
	Start time.Time
	End   time.Time
}

func NewTimeSlotManager() *TimeSlotManager {
	defaultStart := time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)
	defaultEnd := time.Date(2024, 1, 1, 18, 0, 0, 0, time.UTC)
	
	return &TimeSlotManager{
		businessHours: BusinessHours{
			Start: defaultStart,
			End:   defaultEnd,
		},
	}
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

func (tsm *TimeSlotManager) CheckOverlap(slot1, slot2 ManagedTimeSlot) bool {
	return slot1.StartTime.Before(slot2.EndTime) && slot2.StartTime.Before(slot1.EndTime)
}