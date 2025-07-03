import { useState } from 'react'
import { FormTimeSlot, FormSchedule, CreateScheduleResponse } from '../types/schedule'
import { createSchedule } from '../services/api'

export function useScheduleForm() {
  const [comment, setComment] = useState('')
  const [timeSlots, setTimeSlots] = useState<FormTimeSlot[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successData, setSuccessData] = useState<CreateScheduleResponse | null>(null)

  const addTimeSlot = () => {
    const newSlot: FormTimeSlot = {
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

  const submitForm = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await createSchedule({
        comment,
        timeSlots,
      })
      setSuccessData(response)
      return true
    } catch (error) {
      setError('スケジュールの作成に失敗しました')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setComment('')
    setTimeSlots([])
    setError('')
    setIsLoading(false)
    setSuccessData(null)
  }

  return {
    comment,
    setComment,
    timeSlots,
    error,
    isLoading,
    successData,
    setIsLoading,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    validateForm,
    submitForm,
    resetForm,
  }
}