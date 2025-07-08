import { useCallback } from 'react'
import { TimeSlot } from '../types/schedule'

export interface UseTimeSlotManagementReturn {
  hasTimeRangeOverlap: (startDate: Date, startTime: string, endDate: Date, endTime: string) => boolean
}

export default function useTimeSlotManagement(
  timeSlots: TimeSlot[]
): UseTimeSlotManagementReturn {
  // 時間範囲の重複チェック関数
  const hasTimeRangeOverlap = useCallback((startDate: Date, startTime: string, endDate: Date, endTime: string) => {
    if (!timeSlots) return false
    
    const newStart = new Date(`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}T${startTime}:00`)
    const newEnd = new Date(`${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T${endTime}:00`)
    
    return timeSlots.some(timeSlot => {
      const existingStart = new Date(timeSlot.StartTime)
      const existingEnd = new Date(timeSlot.EndTime)
      
      return newStart < existingEnd && newEnd > existingStart
    })
  }, [timeSlots])

  return {
    hasTimeRangeOverlap
  }
}