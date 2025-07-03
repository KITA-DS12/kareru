'use client'

import { useEffect, useState } from 'react'
import { getSchedule } from '../../../services/api'
import { Schedule } from '../../../types/schedule'

interface Props {
  params: {
    uuid: string
  }
}

export default function SchedulePage({ params }: Props) {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const data = await getSchedule(params.uuid)
        setSchedule(data)
        setError(null)
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
        setError('スケジュールが見つかりませんでした')
        setSchedule(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [params.uuid])

  if (loading) {
    return (
      <div data-testid="schedule-page">
        <h1>スケジュール表示</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div data-testid="schedule-page">
        <h1>スケジュール表示</h1>
        <div data-testid="error-message" className="bg-red-100 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div data-testid="schedule-page">
        <h1>スケジュール表示</h1>
        <p>スケジュールが見つかりません</p>
      </div>
    )
  }

  const isExpired = new Date(schedule.expiresAt) < new Date()

  return (
    <div data-testid="schedule-page">
      <h1>スケジュール表示</h1>
      {isExpired && (
        <div data-testid="expired-label" className="bg-red-100 text-red-600 px-2 py-1 rounded">
          期限切れ
        </div>
      )}
      <p>{schedule.comment}</p>
      <div data-testid="time-slot-list">
        {schedule.timeSlots.map((slot, index) => (
          <div key={index}>
            {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
          </div>
        ))}
      </div>
    </div>
  )
}