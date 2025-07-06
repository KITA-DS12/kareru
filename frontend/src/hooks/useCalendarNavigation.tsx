import { useState, useMemo, useCallback, useEffect } from 'react'
import { getJSTNow, getJSTWeekDates, utcToJST } from '../utils/timezone'

export interface UseCalendarNavigationReturn {
  displayDate: Date
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  goToCurrentWeek: () => void
  getWeekRange: () => { start: string; end: string }
  weekDates: Date[]
  todayColumnIndex: number
  isClient: boolean
}

export default function useCalendarNavigation(initialDate?: Date): UseCalendarNavigationReturn {
  const [isClient, setIsClient] = useState(false)
  const [displayDate, setDisplayDate] = useState(() => initialDate || new Date())

  // クライアントサイドでのみレンダリングを有効にする
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 週ナビゲーション関数
  const goToPreviousWeek = useCallback(() => {
    const newDate = new Date(displayDate)
    newDate.setDate(newDate.getDate() - 7)
    setDisplayDate(newDate)
  }, [displayDate])

  const goToNextWeek = useCallback(() => {
    const newDate = new Date(displayDate)
    newDate.setDate(newDate.getDate() + 7)
    setDisplayDate(newDate)
  }, [displayDate])

  const goToCurrentWeek = useCallback(() => {
    setDisplayDate(new Date())
  }, [])

  // 週の範囲を取得する関数
  const getWeekRange = useCallback(() => {
    if (!isClient) return { start: '', end: '' }
    
    const dates = getJSTWeekDates(displayDate)
    const startDate = dates[0] // 日曜日
    const endDate = dates[6] // 土曜日
    
    const formatDate = (date: Date) => {
      const jstDate = utcToJST(date)
      return `${jstDate.getMonth() + 1}月${jstDate.getDate()}日`
    }
    
    const startStr = formatDate(startDate)
    const endStr = formatDate(endDate)
    
    return { start: startStr, end: endStr }
  }, [displayDate, isClient])

  // 週の日付を取得（日本時間ベース）
  const weekDates = useMemo(() => {
    if (!isClient) {
      // サーバーサイドでは固定の日付を返してハイドレーションエラーを防ぐ
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(2024, 0, 1 + i) // 固定日付
        return date
      })
    }
    const dates = getJSTWeekDates(displayDate)
    return dates
  }, [displayDate, isClient])

  // 今日の列インデックスを取得
  const todayColumnIndex = useMemo(() => {
    if (!isClient) return -1 // サーバーサイドでは非表示
    const today = getJSTNow()
    return weekDates.findIndex(date => {
      const dateStr = utcToJST(date).toDateString()
      const todayStr = today.toDateString()
      return dateStr === todayStr
    })
  }, [weekDates, isClient])

  return {
    displayDate,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    getWeekRange,
    weekDates,
    todayColumnIndex,
    isClient
  }
}