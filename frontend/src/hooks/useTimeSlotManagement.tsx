import { useState, useCallback } from 'react'
import { TimeSlot } from '../types/schedule'

interface EditingEvent {
  id: string
  startTime: string
  endTime: string
}

export interface UseTimeSlotManagementReturn {
  editingEvent: EditingEvent | null
  setEditingEvent: (event: EditingEvent | null) => void
  handleEventClick: (event: TimeSlot) => void
  handleEditSave: () => void
  handleDelete: () => void
  hasTimeRangeOverlap: (startDate: Date, startTime: string, endDate: Date, endTime: string) => boolean
}

export default function useTimeSlotManagement(
  timeSlots: TimeSlot[],
  onUpdateTimeSlot?: (id: string, updates: Partial<TimeSlot>) => void,
  onDeleteTimeSlot?: (id: string) => void
): UseTimeSlotManagementReturn {
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null)

  // イベントクリック処理
  const handleEventClick = useCallback((event: TimeSlot) => {
    if (!event.id) return
    
    setEditingEvent({
      id: event.id,
      startTime: event.StartTime,
      endTime: event.EndTime
    })
  }, [])

  // 編集の保存
  const handleEditSave = useCallback(() => {
    if (!editingEvent || !onUpdateTimeSlot) return
    
    onUpdateTimeSlot(editingEvent.id, {
      StartTime: editingEvent.startTime,
      EndTime: editingEvent.endTime
    })
    
    setEditingEvent(null)
  }, [editingEvent, onUpdateTimeSlot])

  // 削除処理
  const handleDelete = useCallback(() => {
    if (!editingEvent || !onDeleteTimeSlot) return
    
    onDeleteTimeSlot(editingEvent.id)
    setEditingEvent(null)
  }, [editingEvent, onDeleteTimeSlot])

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
    editingEvent,
    setEditingEvent,
    handleEventClick,
    handleEditSave,
    handleDelete,
    hasTimeRangeOverlap
  }
}