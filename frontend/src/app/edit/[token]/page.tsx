'use client'

import { useEffect, useState } from 'react'
import { getScheduleByToken } from '../../../services/api'
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
    // 編集機能は削除されました
    setError('編集機能は現在利用できません')
  }

  // カレンダーからの新しいタイムスロット作成
  const handleCreateTimeSlot = (timeSlot: Omit<TimeSlot, 'id'>) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      ...timeSlot
    }
    setTimeSlots(prev => [...prev, newSlot])
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
    <div data-testid="edit-page" className="max-w-5xl mx-auto p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">スケジュール編集</h1>
      <form data-testid="edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        <div>
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
              showWeekNavigation={true}
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-200 mb-2">
            コメント
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-md bg-gray-750 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm focus:shadow-lg"
            rows={3}
            placeholder="スケジュールについてのコメントを入力してください"
          />
        </div>

        {error && (
          <div className="text-red-200 text-sm bg-red-900/50 p-3 rounded border border-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-200 text-sm bg-green-900/50 p-3 rounded border border-green-700">
            ✅ スケジュールが正常に更新されました
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}