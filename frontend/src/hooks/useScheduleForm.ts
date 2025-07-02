import { useState } from 'react'
import { TimeSlot, Schedule } from '../types/schedule'

export function useScheduleForm() {
  const [comment, setComment] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '',
      endTime: ''
    }
    setTimeSlots([...timeSlots, newSlot])
  }

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id))
  }

  const updateTimeSlot = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ))
  }

  const validateForm = (): boolean => {
    setError('')

    if (timeSlots.length === 0) {
      setError('時間スロットを追加してください')
      return false
    }

    for (const slot of timeSlots) {
      if (!slot.startTime || !slot.endTime) {
        setError('全ての時間スロットを入力してください')
        return false
      }
      if (slot.startTime >= slot.endTime) {
        setError('開始時刻は終了時刻より前に設定してください')
        return false
      }
    }

    return true
  }

  const resetForm = () => {
    setComment('')
    setTimeSlots([])
    setError('')
    setIsLoading(false)
  }

  return {
    comment,
    setComment,
    timeSlots,
    error,
    isLoading,
    setIsLoading,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    validateForm,
    resetForm,
  }
}