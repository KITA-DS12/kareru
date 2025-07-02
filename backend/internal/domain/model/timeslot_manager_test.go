package model

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestTimeSlotManager_GenerateSlots(t *testing.T) {
	t.Run("30分刻みでスロット生成", func(t *testing.T) {
		manager := NewTimeSlotManager()
		start := time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)
		end := time.Date(2024, 1, 1, 12, 0, 0, 0, time.UTC)
		
		slots := manager.GenerateSlots(start, end, 30*time.Minute)
		
		assert.Equal(t, 6, len(slots))
		assert.Equal(t, "09:00-09:30", slots[0].Format())
		assert.Equal(t, "11:30-12:00", slots[5].Format())
	})
	
	t.Run("1時間刻みでスロット生成", func(t *testing.T) {
		manager := NewTimeSlotManager()
		start := time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)
		end := time.Date(2024, 1, 1, 12, 0, 0, 0, time.UTC)
		
		slots := manager.GenerateSlots(start, end, 1*time.Hour)
		
		assert.Equal(t, 3, len(slots))
		assert.Equal(t, "09:00-10:00", slots[0].Format())
		assert.Equal(t, "11:00-12:00", slots[2].Format())
	})
	
	t.Run("3時間刻みでスロット生成", func(t *testing.T) {
		manager := NewTimeSlotManager()
		start := time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)
		end := time.Date(2024, 1, 1, 18, 0, 0, 0, time.UTC)
		
		slots := manager.GenerateSlots(start, end, 3*time.Hour)
		
		assert.Equal(t, 3, len(slots))
		assert.Equal(t, "09:00-12:00", slots[0].Format())
		assert.Equal(t, "15:00-18:00", slots[2].Format())
	})
	
	t.Run("6時間刻みでスロット生成", func(t *testing.T) {
		manager := NewTimeSlotManager()
		start := time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)
		end := time.Date(2024, 1, 1, 18, 0, 0, 0, time.UTC)
		
		slots := manager.GenerateSlots(start, end, 6*time.Hour)
		
		assert.Equal(t, 1, len(slots))
		assert.Equal(t, "09:00-15:00", slots[0].Format())
	})
}

func TestTimeSlotManager_CheckOverlap(t *testing.T) {
	manager := NewTimeSlotManager()
	
	t.Run("完全に重複するスロット", func(t *testing.T) {
		slot1 := ManagedTimeSlot{
			StartTime: time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
		}
		slot2 := ManagedTimeSlot{
			StartTime: time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
		}
		
		hasOverlap := manager.CheckOverlap(slot1, slot2)
		assert.True(t, hasOverlap)
	})
	
	t.Run("部分的に重複するスロット", func(t *testing.T) {
		slot1 := ManagedTimeSlot{
			StartTime: time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2024, 1, 1, 10, 30, 0, 0, time.UTC),
		}
		slot2 := ManagedTimeSlot{
			StartTime: time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2024, 1, 1, 11, 0, 0, 0, time.UTC),
		}
		
		hasOverlap := manager.CheckOverlap(slot1, slot2)
		assert.True(t, hasOverlap)
	})
	
	t.Run("重複しないスロット", func(t *testing.T) {
		slot1 := ManagedTimeSlot{
			StartTime: time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
		}
		slot2 := ManagedTimeSlot{
			StartTime: time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2024, 1, 1, 11, 0, 0, 0, time.UTC),
		}
		
		hasOverlap := manager.CheckOverlap(slot1, slot2)
		assert.False(t, hasOverlap)
	})
}