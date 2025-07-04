'use client'

import { useEffect, useState } from 'react'
import { getSchedule } from '../../../services/api'
import { Schedule } from '../../../types/schedule'
import { validateScheduleURL } from '../../../utils/url-validation'
import { notFound } from 'next/navigation'
import CalendarGrid from '../../../components/calendar/CalendarGrid'

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
    // URLバリデーションをチェック
    const validation = validateScheduleURL(params.uuid)
    if (!validation.isValid) {
      notFound()
      return
    }

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

  const isExpired = schedule.expiresAt ? new Date(schedule.expiresAt) < new Date() : false

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return '無効な日時'
    }
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  const formatTime = (date: Date | string) => {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return '無効な時刻'
    }
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  }

  return (
    <div data-testid="schedule-page" className="min-h-screen bg-gray-900 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100 mb-3">スケジュール表示</h1>
          {isExpired && (
            <div data-testid="expired-label" className="inline-block bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium">
              期限切れ
            </div>
          )}
        </header>

        <main className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <section className="mb-6">
            <h2 className="text-lg font-medium text-gray-200 mb-3">スケジュール</h2>
            <CalendarGrid schedule={schedule} showWeekNavigation={true} />
          </section>

          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-200 mb-2">コメント</h2>
            <div className="bg-gray-700 p-4 rounded border border-gray-600">
              <p className="text-gray-200 text-sm leading-relaxed">{schedule.comment}</p>
            </div>
          </section>

          <footer className="text-xs text-gray-400 space-y-2 bg-gray-700 p-3 rounded">
            <p>作成: {formatDate(schedule.createdAt)}</p>
            <p>有効期限: {formatDate(schedule.expiresAt)}</p>
          </footer>
        </main>
      </div>
    </div>
  )
}