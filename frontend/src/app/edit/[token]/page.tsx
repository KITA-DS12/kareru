'use client'

import { useEffect, useState } from 'react'
import { getScheduleByToken, updateSchedule } from '../../../services/api'
import { Schedule } from '../../../types/schedule'

interface Props {
  params: {
    token: string
  }
}

export default function EditPage({ params }: Props) {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [timeSlots, setTimeSlots] = useState<Schedule['timeSlots']>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const data = await getScheduleByToken(params.token)
        setSchedule(data)
        setComment(data.comment)
        setTimeSlots(data.timeSlots)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch schedule by token:', error)
        setError('編集権限がありません')
        setSchedule(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [params.token])

  const handleSave = async () => {
    if (!schedule) return

    try {
      setSaving(true)
      await updateSchedule(params.token, {
        comment,
        timeSlots
      })
      // 成功通知などは後で実装
    } catch (error) {
      console.error('Failed to update schedule:', error)
      setError('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const toggleTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, Available: !slot.Available } : slot
    ))
  }

  if (loading) {
    return (
      <div data-testid="edit-page">
        <h1>スケジュール編集</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="edit-page">
        <h1>スケジュール編集</h1>
        <div data-testid="error-message" className="bg-red-100 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div data-testid="edit-page">
        <h1>スケジュール編集</h1>
        <p>スケジュールが見つかりません</p>
      </div>
    )
  }

  return (
    <div data-testid="edit-page">
      <h1>スケジュール編集</h1>
      <form data-testid="edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div>
          <label htmlFor="comment">コメント:</label>
          <input
            id="comment"
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        
        <div data-testid="timeslot-list">
          <h3>タイムスロット:</h3>
          {timeSlots.map((slot, index) => (
            <div key={index}>
              <label>
                <input
                  type="checkbox"
                  checked={slot.Available}
                  onChange={() => toggleTimeSlot(index)}
                />
                {new Date(slot.StartTime).toLocaleTimeString()} - {new Date(slot.EndTime).toLocaleTimeString()}
              </label>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}