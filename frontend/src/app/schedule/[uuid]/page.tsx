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
    <div data-testid="schedule-page" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">スケジュール表示</h1>
          {isExpired && (
            <div data-testid="expired-label" className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
              期限切れ
            </div>
          )}
        </header>

        <main className="bg-white rounded-lg shadow-sm border p-6">
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">コメント</h2>
            <p className="text-gray-600 leading-relaxed">{schedule.comment}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">スケジュール</h2>
            <CalendarGrid schedule={schedule} />
          </section>

          <footer className="text-sm text-gray-500 space-y-1">
            <p>作成日時: {formatDate(schedule.createdAt)}</p>
            <p>有効期限: {formatDate(schedule.expiresAt)}</p>
          </footer>
        </main>
      </div>
    </div>
  )
}