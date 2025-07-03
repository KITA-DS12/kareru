'use client'

import { useEffect, useState } from 'react'
import { getScheduleByToken, updateSchedule } from '../../../services/api'
import { Schedule } from '../../../types/schedule'
import { validateEditURL } from '../../../utils/url-validation'
import { notFound } from 'next/navigation'

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
    <div data-testid="edit-page" className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">スケジュール編集</h1>
      <form data-testid="edit-form" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            コメント:
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="スケジュールについてのコメントを入力してください"
          />
        </div>
        
        <div data-testid="timeslot-list">
          <h3 className="text-lg font-medium text-gray-900 mb-4">タイムスロット:</h3>
          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div key={index} className="flex items-center p-4 border border-gray-200 rounded-md bg-gray-50">
                <input
                  type="checkbox"
                  checked={slot.Available}
                  onChange={() => toggleTimeSlot(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(slot.StartTime).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} 
                    ～ 
                    {new Date(slot.EndTime).toLocaleString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {slot.Available ? '✅ 利用可能' : '❌ 利用不可'}
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
            ✅ スケジュールが正常に更新されました
          </div>
        )}

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}