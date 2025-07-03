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

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getSchedule(params.uuid)
        setSchedule(data)
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
      }
    }

    fetchSchedule()
  }, [params.uuid])

  if (!schedule) {
    return (
      <div data-testid="schedule-page">
        <h1>スケジュール表示</h1>
        <p>Loading...</p>
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