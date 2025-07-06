import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Schedule, TimeSlot } from '../../types/schedule'
import {
  getJSTNow,
  getJSTWeekDates,
  getCurrentJSTMinutes,
  isJSTToday,
  utcToJST,
  formatJSTTime
} from '../../utils/timezone'
import WeekNavigation from './WeekNavigation'
import DurationSelector from './DurationSelector'
import TimeSlotGrid from './TimeSlotGrid'
import EventEditor from './EventEditor'
import useTimeSlotManagement from '../../hooks/useTimeSlotManagement'

type DurationMode = '30min' | '1h' | '3h' | '1day'

interface CalendarGridProps {
  schedule?: Schedule
  currentDate?: Date
  onCreateTimeSlot?: (timeSlot: Omit<TimeSlot, 'id'>) => void
  onCreateTimeSlots?: (timeSlots: Array<Omit<TimeSlot, 'id'>>) => void
  onCreateTimeSlotsWithMerge?: (timeSlots: Array<Omit<TimeSlot, 'id'>>) => void
  onUpdateTimeSlot?: (id: string, updates: Partial<TimeSlot>) => void
  onDeleteTimeSlot?: (id: string) => void
  showWeekNavigation?: boolean
}

interface EditingEvent {
  id: string
  startTime: string
  endTime: string
}

export default function CalendarGrid({
  schedule,
  currentDate = new Date(),
  onCreateTimeSlot,
  onCreateTimeSlots,
  onCreateTimeSlotsWithMerge,
  onUpdateTimeSlot,
  onDeleteTimeSlot,
  showWeekNavigation = true
}: CalendarGridProps) {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [durationMode, setDurationMode] = useState<DurationMode>('30min')
  const [isClient, setIsClient] = useState(false)
  const [displayDate, setDisplayDate] = useState(() => currentDate)
  
  // タイムスロット管理フック
  const {
    editingEvent,
    setEditingEvent,
    handleEventClick,
    handleEditSave,
    handleDelete,
    hasTimeRangeOverlap
  } = useTimeSlotManagement(schedule?.timeSlots || [], onUpdateTimeSlot, onDeleteTimeSlot)
  
  const containerRef = useRef<HTMLDivElement>(null)
  
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
  
  // 時間枠選択モードに応じたスロット数を計算
  const getDurationSlots = useCallback((mode: DurationMode): number => {
    switch (mode) {
      case '30min': return 1
      case '1h': return 2
      case '3h': return 6
      case '1day': return 48
      default: return 1
    }
  }, [])
  
  // 24時間分の30分刻みタイムスロット生成
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        const endHour = minute === 30 ? hour + 1 : hour
        const endMinute = minute === 30 ? 0 : 30
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
        
        slots.push({
          hour,
          minute,
          label: startTime,
          timeRange: `${startTime} - ${endTime}`
        })
      }
    }
    return slots
  }, [])
  
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
    // console.log('Week dates:', dates.map((date, index) => `${index}: ${date.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`))
    // console.log('Week dates ISO:', dates.map((date, index) => `${index}: ${date.toISOString()}`))
    return dates
  }, [displayDate, isClient])
  
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  
  // 現在時刻の位置計算（日本時間）
  const getCurrentTimePosition = useCallback(() => {
    const minutes = getCurrentJSTMinutes()
    const slotIndex = Math.floor(minutes / 30)
    
    // クライアントサイドでのみ実行
    if (typeof document !== 'undefined') {
      // 実際のタイムスロット要素を取得して位置を計算
      const slotElement = document.querySelector(`[data-slot-index="${slotIndex}"]`)
      const containerRect = containerRef.current?.getBoundingClientRect()
      
      if (slotElement && containerRect) {
        const slotRect = slotElement.getBoundingClientRect()
        return slotRect.top - containerRect.top + (minutes % 30) * (32 / 30)
      }
    }
    
    return slotIndex * 32 + (minutes % 30) * (32 / 30)
  }, [])
  
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
  
  // 日付別のイベント取得
  const getOverlappingEvents = useCallback((dayIndex: number) => {
    if (!schedule?.timeSlots) return []
    
    const dayDate = weekDates[dayIndex]
    if (!dayDate) return []
    
    const filteredEvents = schedule.timeSlots.filter(timeSlot => {
      const eventStartTime = new Date(timeSlot.StartTime)
      const jstEventStart = utcToJST(eventStartTime)
      const jstDayDate = utcToJST(dayDate)
      
      const isMatch = jstEventStart.toDateString() === jstDayDate.toDateString()
      
      if (dayIndex === 3) { // 水曜日（今テストしている日）のログを出力
        // console.log(`DEBUG: Event filter for day ${dayIndex}:`)
        // console.log(`  TimeSlot: ${timeSlot.StartTime} - ${timeSlot.EndTime}`)
        // console.log(`  EventStart JST: ${jstEventStart.toDateString()}`)
        // console.log(`  DayDate JST: ${jstDayDate.toDateString()}`)
        // console.log(`  Match: ${isMatch}`)
      }
      
      return isMatch
    })
    
    if (dayIndex === 3) {
      // console.log(`DEBUG: Filtered events for day ${dayIndex}: ${filteredEvents.length}`)
      // console.log(`DEBUG: All timeSlots in schedule:`, schedule?.timeSlots?.map(slot => 
      //   `${slot.StartTime} - ${slot.EndTime}`
      // ))
    }
    
    return filteredEvents
  }, [schedule?.timeSlots, weekDates])
  
  // イベントの表示スタイル計算（スロット内での相対位置）
  const getEventStyle = useCallback((event: TimeSlot, slotIndex: number) => {
    const startTime = new Date(event.StartTime)
    const endTime = new Date(event.EndTime)
    const jstStart = utcToJST(startTime)
    const jstEnd = utcToJST(endTime)
    
    const startMinutes = jstStart.getHours() * 60 + jstStart.getMinutes()
    const endMinutes = jstEnd.getHours() * 60 + jstEnd.getMinutes()
    const duration = endMinutes - startMinutes
    
    // 現在のスロットの開始時刻（分）
    const slotStartMinutes = slotIndex * 30
    
    // イベントの開始位置をスロット内での相対位置として計算
    const relativeStartMinutes = startMinutes - slotStartMinutes
    const topPosition = (relativeStartMinutes / 30) * 32
    
    const height = (duration / 30) * 32
    
    return {
      top: `${Math.max(1, topPosition + 1)}px`,
      height: `${Math.max(height - 2, 20)}px`,
      minHeight: '20px'
    }
  }, [])
  
  // スロットがタイムスロットに含まれるかチェック
  const isSlotInTimeSlot = useCallback((dayIndex: number, slotIndex: number, timeSlot: TimeSlot) => {
    const slotDate = weekDates[dayIndex]
    if (!slotDate) return false
    
    const eventStartTime = new Date(timeSlot.StartTime)
    const jstEventStart = utcToJST(eventStartTime)
    const jstSlotDate = utcToJST(slotDate)
    
    if (jstSlotDate.toDateString() !== jstEventStart.toDateString()) return false
    
    const slotStartMinutes = slotIndex * 30
    const eventStartMinutes = jstEventStart.getHours() * 60 + jstEventStart.getMinutes()
    const eventEndMinutes = utcToJST(new Date(timeSlot.EndTime)).getHours() * 60 + utcToJST(new Date(timeSlot.EndTime)).getMinutes()
    
    return slotStartMinutes >= eventStartMinutes && slotStartMinutes < eventEndMinutes
  }, [weekDates])
  
  
  // エラーメッセージの自動非表示
  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])
  
  // 時間枠選択モードに応じたクリック処理
  const handleSlotClick = useCallback((dayIndex: number, slotIndex: number) => {
    // console.log(`DEBUG: handleSlotClick called with dayIndex=${dayIndex}, slotIndex=${slotIndex}, mode=${durationMode}`)
    if (!onCreateTimeSlot) return
    
    const dayDate = weekDates[dayIndex]
    const jstDayDate = utcToJST(dayDate)
    
    // 1day選択の場合は0:00～23:59を選択
    if (durationMode === '1day') {
      // 0:00～23:59の時間枠を作成（重複時は自動マージ）
      const startTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T00:00:00`
      const endTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T23:59:00`
      
      if (onCreateTimeSlotsWithMerge) {
        onCreateTimeSlotsWithMerge([{
          StartTime: startTimeStr,
          EndTime: endTimeStr
        }])
      } else if (onCreateTimeSlot) {
        onCreateTimeSlot({
          StartTime: startTimeStr,
          EndTime: endTimeStr
        })
      }
      return
    }
    
    // 通常の時間枠選択処理
    const slotsToCreate = getDurationSlots(durationMode)
    const endSlotIndex = slotIndex + slotsToCreate
    
    // console.log(`Slot Click: dayIndex=${dayIndex}, slotIndex=${slotIndex}, mode=${durationMode}, slots=${slotsToCreate}`)
    
    // 日をまたぐかどうかチェック（48スロット = 24時間、インデックス0-47）
    if (endSlotIndex >= 48) {
      // console.log(`DEBUG: Cross-day detected - startSlot=${slotIndex}, endSlot=${endSlotIndex}, slotsToCreate=${slotsToCreate}`)
      // console.log(`DEBUG: dayDate=${dayDate.toISOString()}, jstDayDate=${jstDayDate.toISOString()}`)
      
      // 日をまたぐ場合：当日分と翌日分に分割
      const todayEndSlot = 48
      const tomorrowStartSlot = 0
      const tomorrowEndSlot = endSlotIndex - 48
      
      // console.log(`DEBUG: Split - today: ${slotIndex}-${todayEndSlot}, tomorrow: ${tomorrowStartSlot}-${tomorrowEndSlot}`)
      
      // 当日分と翌日分の時間計算
      const startHours = Math.floor(slotIndex / 2)
      const startMinutes = (slotIndex % 2) * 30
      const endHours = Math.floor(tomorrowEndSlot / 2)
      const endMinutes = (tomorrowEndSlot % 2) * 30
      
      const nextDayIndex = dayIndex + 1
      const nextDayDate = weekDates[nextDayIndex]
      const jstNextDayDate = nextDayIndex < weekDates.length ? utcToJST(nextDayDate) : null
      
      // 当日分を作成（開始時刻～23:59）
      const todayStartTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`
      const todayEndTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T23:59:00`
      
      // console.log(`Cross-day today: ${todayStartTimeStr} - ${todayEndTimeStr}`)
      
      // 翌日分を作成（00:00～終了時刻）
      if (nextDayIndex < weekDates.length) {
        const nextDayDate = weekDates[nextDayIndex]
        const jstNextDayDate = utcToJST(nextDayDate)
        const endHours = Math.floor(tomorrowEndSlot / 2)
        const endMinutes = (tomorrowEndSlot % 2) * 30
        
        const tomorrowStartTimeStr = `${jstNextDayDate.getFullYear()}-${String(jstNextDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstNextDayDate.getDate()).padStart(2, '0')}T00:00:00`
        const tomorrowEndTimeStr = `${jstNextDayDate.getFullYear()}-${String(jstNextDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstNextDayDate.getDate()).padStart(2, '0')}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
        
        // console.log(`Cross-day tomorrow: ${tomorrowStartTimeStr} - ${tomorrowEndTimeStr}`)
        
        // 両方のタイムスロットを一度に作成（重複時は自動マージ）
        if (onCreateTimeSlotsWithMerge) {
          onCreateTimeSlotsWithMerge([
            {
              StartTime: todayStartTimeStr,
              EndTime: todayEndTimeStr
            },
            {
              StartTime: tomorrowStartTimeStr,
              EndTime: tomorrowEndTimeStr
            }
          ])
        } else if (onCreateTimeSlots) {
          onCreateTimeSlots([
            {
              StartTime: todayStartTimeStr,
              EndTime: todayEndTimeStr
            },
            {
              StartTime: tomorrowStartTimeStr,
              EndTime: tomorrowEndTimeStr
            }
          ])
        } else if (onCreateTimeSlot) {
          // フォールバック：従来の方法
          onCreateTimeSlot({
            StartTime: todayStartTimeStr,
            EndTime: todayEndTimeStr
          })
        }
      }
      
      return
    }
    
    // 同日内での通常処理
    const startHours = Math.floor(slotIndex / 2)
    const startMinutes = (slotIndex % 2) * 30
    const endHours = Math.floor(endSlotIndex / 2)
    const endMinutes = (endSlotIndex % 2) * 30
    
    // 時間文字列の作成
    const startTime = `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
    
    // 日本時間でのISO文字列を作成
    const startTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T${startTime}`
    const endTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T${endTime}`
    
    // 重複時は自動マージで作成
    if (onCreateTimeSlotsWithMerge) {
      onCreateTimeSlotsWithMerge([{
        StartTime: startTimeStr,
        EndTime: endTimeStr
      }])
    } else if (onCreateTimeSlot) {
      onCreateTimeSlot({
        StartTime: startTimeStr,
        EndTime: endTimeStr
      })
    }
  }, [onCreateTimeSlot, onCreateTimeSlots, onCreateTimeSlotsWithMerge, weekDates, schedule?.timeSlots, isSlotInTimeSlot, weekdays, durationMode, getDurationSlots])
  
  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <div className="p-4 text-center text-gray-300">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}
      
      {/* 時間枠選択モード */}
      <DurationSelector
        currentMode={durationMode}
        onDurationChange={setDurationMode}
      />
      
      {/* 週ナビゲーション */}
      {showWeekNavigation && (
        <WeekNavigation
          onPreviousWeek={goToPreviousWeek}
          onCurrentWeek={goToCurrentWeek}
          onNextWeek={goToNextWeek}
          getWeekRange={getWeekRange}
        />
      )}
      
      {/* タイムグリッド */}
      <TimeSlotGrid
        schedule={schedule}
        weekDates={weekDates}
        todayColumnIndex={todayColumnIndex}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
        hoveredEvent={hoveredEvent}
        onEventHover={setHoveredEvent}
      />
      
      {/* 編集モーダル */}
      {editingEvent && (
        <EventEditor
          editingEvent={editingEvent}
          onSave={handleEditSave}
          onDelete={handleDelete}
          onClose={() => setEditingEvent(null)}
          onUpdate={(updates) => setEditingEvent(prev => prev ? { ...prev, ...updates } : null)}
        />
      )}
    </div>
  )
}