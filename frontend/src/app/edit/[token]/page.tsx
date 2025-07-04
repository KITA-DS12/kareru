'use client'

import { useEffect, useState } from 'react'
import { getScheduleByToken, updateSchedule } from '../../../services/api'
import { Schedule, TimeSlot } from '../../../types/schedule'
import { validateEditURL } from '../../../utils/url-validation'
import { notFound } from 'next/navigation'
import CalendarGrid from '../../../components/calendar/CalendarGrid'

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
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // URLバリデーションをチェック
    const validation = validateEditURL(params.token)
    if (!validation.isValid) {
      notFound()
      return
    }

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
      setError(null)
      setSuccess(false)
      await updateSchedule(params.token, {
        comment,
        timeSlots
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to update schedule:', error)
      setError('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // カレンダーからの新しいタイムスロット作成
  const handleCreateTimeSlot = (timeSlot: Omit<TimeSlot, 'id'>) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      ...timeSlot
    }
    setTimeSlots(prev => [...prev, newSlot])
  }

  // タイムスロットの更新
  const handleUpdateTimeSlot = (id: string, updates: Partial<TimeSlot>) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    ))
  }

  // タイムスロットの削除
  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== id))
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
        <div data-testid="error-message" className="bg-green-100 text-green-600 px-4 py-2 rounded">
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
    <div data-testid="edit-page" className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-4">スケジュール編集</h1>
      <form data-testid="edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">時間スロット</h3>
          
          {/* カレンダーUI */}
          <div className="mb-4">
            <CalendarGrid 
              schedule={{
                id: schedule.id || '',
                comment: comment,
                timeSlots: timeSlots,
                editToken: params.token,
                createdAt: schedule.createdAt || '',
                expiresAt: schedule.expiresAt || ''
              }}
              onCreateTimeSlot={handleCreateTimeSlot}
              onUpdateTimeSlot={handleUpdateTimeSlot}
              onDeleteTimeSlot={handleDeleteTimeSlot}
              showWeekNavigation={true}
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            コメント
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={2}
            placeholder="スケジュールについてのコメント"
          />
        </div>

        {error && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
            ✅ スケジュールが正常に更新されました
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}