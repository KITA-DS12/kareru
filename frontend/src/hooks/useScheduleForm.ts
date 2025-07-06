import { useState } from 'react'
import { FormTimeSlot, FormSchedule, CreateScheduleResponse } from '../types/schedule'
import { createSchedule } from '../services/api'

export function useScheduleForm() {
  const [comment, setComment] = useState('')
  const [timeSlots, setTimeSlots] = useState<FormTimeSlot[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successData, setSuccessData] = useState<CreateScheduleResponse | null>(null)

  // 連続するタイムスロットを結合する関数
  const mergeConsecutiveSlots = (slots: FormTimeSlot[]): FormTimeSlot[] => {
    if (slots.length <= 1) return slots

    // 開始時刻でソート
    const sortedSlots = [...slots].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    const merged: FormTimeSlot[] = []
    let current = sortedSlots[0]

    for (let i = 1; i < sortedSlots.length; i++) {
      const next = sortedSlots[i]
      
      // 日付をチェックして同じ日付内でのみ結合を許可
      const currentEndDate = new Date(current.endTime)
      const nextStartDate = new Date(next.startTime)
      const isSameDate = currentEndDate.toDateString() === nextStartDate.toDateString()
      
      // 現在のスロットの終了時刻と次のスロットの開始時刻が連続している場合
      // ただし、同じ日付内でのみ結合を許可
      if (current.endTime === next.startTime && isSameDate) {
        // 結合して継続
        current = {
          ...current,
          endTime: next.endTime
        }
      } else {
        // 連続していない場合は現在のスロットを結果に追加
        merged.push(current)
        current = next
      }
    }
    
    // 最後のスロットを追加
    merged.push(current)
    
    return merged
  }

  const addTimeSlot = (startTime?: string, endTime?: string) => {
    const newSlot: FormTimeSlot = {
      id: Date.now().toString(),
      startTime: startTime || '',
      endTime: endTime || ''
    }
    
    const updatedSlots = [...timeSlots, newSlot]
    const mergedSlots = mergeConsecutiveSlots(updatedSlots)
    setTimeSlots(mergedSlots)
  }

  // 複数のタイムスロットを一度に追加する関数
  const addTimeSlots = (newSlots: Array<{ startTime: string; endTime: string }>) => {
    const formattedSlots: FormTimeSlot[] = newSlots.map((slot, index) => ({
      id: (Date.now() + index).toString(),
      startTime: slot.startTime,
      endTime: slot.endTime
    }))
    
    const updatedSlots = [...timeSlots, ...formattedSlots]
    const mergedSlots = mergeConsecutiveSlots(updatedSlots)
    setTimeSlots(mergedSlots)
  }

  // 重複を含む時間スロットを統合する関数（重複時は結合）
  const addTimeSlotsWithMerge = (newSlots: Array<{ startTime: string; endTime: string }>) => {
    const formattedSlots: FormTimeSlot[] = newSlots.map((slot, index) => ({
      id: (Date.now() + index).toString(),
      startTime: slot.startTime,
      endTime: slot.endTime
    }))
    
    // 既存スロットと新規スロットを統合
    const allSlots = [...timeSlots, ...formattedSlots]
    
    // 重複する範囲も含めて全て結合
    const mergedSlots = mergeOverlappingSlots(allSlots)
    setTimeSlots(mergedSlots)
  }

  // 重複・隣接する時間スロットを全て結合する関数
  const mergeOverlappingSlots = (slots: FormTimeSlot[]): FormTimeSlot[] => {
    if (slots.length <= 1) return slots

    // 開始時刻でソート
    const sortedSlots = [...slots].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    const merged: FormTimeSlot[] = []
    let current = sortedSlots[0]

    for (let i = 1; i < sortedSlots.length; i++) {
      const next = sortedSlots[i]
      
      const currentEnd = new Date(current.endTime)
      const nextStart = new Date(next.startTime)
      const nextEnd = new Date(next.endTime)
      
      // 重複または隣接している場合は結合
      // (current.end >= next.start) で重複・隣接をチェック
      if (currentEnd >= nextStart) {
        // 結合：終了時刻は後の方を採用
        current = {
          ...current,
          endTime: currentEnd > nextEnd ? current.endTime : next.endTime
        }
      } else {
        // 重複していない場合は現在のスロットを保存
        merged.push(current)
        current = next
      }
    }
    
    // 最後のスロットを追加
    merged.push(current)
    
    return merged
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
      setError('カレンダーから利用可能な時間を選択してください')
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
    addTimeSlots,
    addTimeSlotsWithMerge,
    removeTimeSlot,
    updateTimeSlot,
    validateForm,
    submitForm,
    resetForm,
  }
}