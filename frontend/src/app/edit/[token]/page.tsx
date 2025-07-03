'use client'

import { useEffect, useState } from 'react'
import { getScheduleByToken } from '../../../services/api'
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

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const data = await getScheduleByToken(params.token)
        setSchedule(data)
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
      <form data-testid="edit-form">
        <div>
          <label htmlFor="comment">コメント:</label>
          <input
            id="comment"
            type="text"
            defaultValue={schedule.comment}
          />
        </div>
      </form>
    </div>
  )
}