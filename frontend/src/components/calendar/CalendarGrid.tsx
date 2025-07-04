import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Schedule, TimeSlot } from '../../types/schedule'
import {
  getJSTNow,
  getJSTWeekDates,
  getCurrentJSTMinutes,
  isJSTToday,
  utcToJST,
  formatJSTTime
} from '../../utils/timezone'

interface CalendarGridProps {
  schedule?: Schedule
  currentDate?: Date
  onCreateTimeSlot?: (timeSlot: Omit<TimeSlot, 'id'>) => void
  onUpdateTimeSlot?: (id: string, updates: Partial<TimeSlot>) => void
  onDeleteTimeSlot?: (id: string) => void
}

interface EditingEvent {
  id: string
  startTime: string
  endTime: string
  available: boolean
}

export default function CalendarGrid({
  schedule,
  currentDate = new Date(),
  onCreateTimeSlot,
  onUpdateTimeSlot,
  onDeleteTimeSlot
}: CalendarGridProps) {
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  
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
    const dates = getJSTWeekDates(currentDate)
    console.log('Week dates:', dates.map((date, index) => `${index}: ${date.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`))
    console.log('Week dates ISO:', dates.map((date, index) => `${index}: ${date.toISOString()}`))
    return dates
  }, [currentDate])
  
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  
  // 現在時刻の位置計算（日本時間）
  const getCurrentTimePosition = useCallback(() => {
    const minutes = getCurrentJSTMinutes()
    const slotIndex = Math.floor(minutes / 30)
    
    // 実際のタイムスロット要素を取得して位置を計算
    const slotElement = document.querySelector(`[data-slot-index="${slotIndex}"]`)
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    if (slotElement && containerRect) {
      const slotRect = slotElement.getBoundingClientRect()
      return slotRect.top - containerRect.top + (minutes % 30) * (64 / 30)
    }
    
    return slotIndex * 64 + (minutes % 30) * (64 / 30)
  }, [])
  
  // 今日の列インデックスを取得
  const todayColumnIndex = useMemo(() => {
    const today = getJSTNow()
    return weekDates.findIndex(date => {
      const dateStr = utcToJST(date).toDateString()
      const todayStr = today.toDateString()
      return dateStr === todayStr
    })
  }, [weekDates])
  
  // 日付別のイベント取得
  const getOverlappingEvents = useCallback((dayIndex: number) => {
    if (!schedule?.timeSlots) return []
    
    const dayDate = weekDates[dayIndex]
    if (!dayDate) return []
    
    return schedule.timeSlots.filter(timeSlot => {
      const eventStartTime = new Date(timeSlot.StartTime)
      const jstEventStart = utcToJST(eventStartTime)
      const jstDayDate = utcToJST(dayDate)
      
      return jstEventStart.toDateString() === jstDayDate.toDateString()
    })
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
    const topPosition = (relativeStartMinutes / 30) * 64
    
    const height = (duration / 30) * 64
    
    return {
      top: `${Math.max(2, topPosition + 2)}px`,
      height: `${Math.max(height - 4, 28)}px`,
      minHeight: '28px'
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
  
  // 簡素化されたクリック処理
  const handleSlotClick = useCallback((dayIndex: number, slotIndex: number) => {
    if (!onCreateTimeSlot) return
    
    // デバッグログ
    console.log(`Slot Click: dayIndex=${dayIndex}, slotIndex=${slotIndex}`)
    console.log(`Slot Click: weekDates[${dayIndex}] = ${weekDates[dayIndex]?.getDate()}日 (${weekdays[weekDates[dayIndex]?.getDay() || 0]})`)
    console.log(`Slot Click: timeSlot = ${Math.floor(slotIndex / 2).toString().padStart(2, '0')}:${(slotIndex % 2) * 30 === 0 ? '00' : '30'}`)
    
    // 既存のイベントがある場合はスキップ
    const hasExistingEvent = schedule?.timeSlots?.some(timeSlot => 
      isSlotInTimeSlot(dayIndex, slotIndex, timeSlot)
    )
    if (hasExistingEvent) {
      setErrorMessage('既に予定がある時間帯です')
      return
    }
    
    // 簡素化された時刻計算
    const startHours = Math.floor(slotIndex / 2)
    const startMinutes = (slotIndex % 2) * 30
    const endHours = Math.floor((slotIndex + 1) / 2)
    const endMinutes = ((slotIndex + 1) % 2) * 30
    
    // 日付を取得（日本時間ベース）
    const dayDate = weekDates[dayIndex]
    const jstDayDate = utcToJST(dayDate)
    
    // 日本時間でのISO文字列を作成
    const startTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}:00`
    const endTimeStr = `${jstDayDate.getFullYear()}-${String(jstDayDate.getMonth() + 1).padStart(2, '0')}-${String(jstDayDate.getDate()).padStart(2, '0')}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
    
    console.log(`Time Debug: startTimeStr=${startTimeStr}, endTimeStr=${endTimeStr}`)
    
    // タイムスロットを作成
    onCreateTimeSlot({
      StartTime: startTimeStr,
      EndTime: endTimeStr,
      Available: true
    })
  }, [onCreateTimeSlot, weekDates, schedule?.timeSlots, isSlotInTimeSlot, weekdays])
  
  // イベントクリック処理
  const handleEventClick = useCallback((event: TimeSlot) => {
    if (!event.id) return
    
    setEditingEvent({
      id: event.id,
      startTime: event.StartTime,
      endTime: event.EndTime,
      available: event.Available
    })
  }, [])
  
  // 編集の保存
  const handleEditSave = useCallback(() => {
    if (!editingEvent || !onUpdateTimeSlot) return
    
    onUpdateTimeSlot(editingEvent.id, {
      StartTime: editingEvent.startTime,
      EndTime: editingEvent.endTime,
      Available: editingEvent.available
    })
    
    setEditingEvent(null)
  }, [editingEvent, onUpdateTimeSlot])
  
  // 削除処理
  const handleDelete = useCallback(() => {
    if (!editingEvent || !onDeleteTimeSlot) return
    
    onDeleteTimeSlot(editingEvent.id)
    setEditingEvent(null)
  }, [editingEvent, onDeleteTimeSlot])
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}
      
      {/* 週ヘッダー */}
      <div className="grid grid-cols-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="p-4 text-center font-semibold text-gray-600 border-r border-gray-100">
          時刻
        </div>
        {weekDates.map((date, index) => {
          const jstDate = utcToJST(date)
          const isToday = todayColumnIndex === index
          return (
            <div 
              key={`header-${date.toISOString()}`}
              className={`p-4 text-center border-r border-gray-100 transition-colors ${
                isToday 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium">
                {weekdays[jstDate.getDay()]}
              </div>
              <div className={`text-lg ${isToday ? 'font-bold' : 'font-medium'}`}>
                {jstDate.getDate()}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* タイムグリッド */}
      <div 
        ref={containerRef}
        data-testid="time-grid-container"
        className="relative overflow-y-auto h-[600px] bg-gradient-to-b from-white to-gray-25"
      >
        {/* 現在時刻インジケーター */}
        {todayColumnIndex !== -1 && (
          <div
            data-testid="current-time-indicator"
            className="absolute bg-red-500 pointer-events-none z-10"
            style={{
              left: `${12.5 + todayColumnIndex * 12.5}%`,
              width: '12.5%',
              top: `${getCurrentTimePosition()}px`,
              height: '2px',
              borderRadius: '1px'
            }}
          />
        )}
        
        {/* タイムスロット */}
        <div className="grid grid-cols-8">
          {timeSlots.map((slot, slotIndex) => (
            <React.Fragment key={`slot-${slotIndex}`}>
              {/* 時刻ラベル */}
              <div 
                className="h-16 border-r border-gray-200 bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-600"
                data-testid={`time-label-${slotIndex}`}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500">{slot.label}</div>
                  <div className="text-xs text-gray-400">{slot.timeRange}</div>
                </div>
              </div>
              
              {/* 各日のタイムスロット */}
              {weekDates.map((date, dayIndex) => (
                <div
                  key={`day-${date.toISOString()}-slot-${slotIndex}`}
                  data-testid={`time-slot-${date.getDate()}-${slotIndex}`}
                  data-day-index={dayIndex}
                  data-slot-index={slotIndex}
                  data-time-start={`${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`}
                  className={`calendar-time-slot h-16 border-r border-gray-200 cursor-pointer relative group ${
                    slotIndex % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-dashed border-gray-100'
                  } ${
                    // 今日の列をハイライト
                    todayColumnIndex === dayIndex ? 'bg-blue-25' : 'hover:bg-blue-50'
                  } ${
                    // 既存のイベントがある場合の緑枠表示
                    schedule?.timeSlots?.some(timeSlot => 
                      isSlotInTimeSlot(dayIndex, slotIndex, timeSlot)
                    ) ? (
                      schedule.timeSlots.find(timeSlot => 
                        isSlotInTimeSlot(dayIndex, slotIndex, timeSlot)
                      )?.Available ? 'selected-available' : 'selected-unavailable'
                    ) : ''
                  }`}
                  onClick={() => handleSlotClick(dayIndex, slotIndex)}
                >
                  {/* イベントバー */}
                  {getOverlappingEvents(dayIndex)
                    .filter(event => {
                      const eventStart = new Date(event.StartTime)
                      const jstEventStart = utcToJST(eventStart)
                      const eventStartMinutes = jstEventStart.getHours() * 60 + jstEventStart.getMinutes()
                      const slotStart = slot.hour * 60 + slot.minute
                      const slotEnd = slotStart + 30
                      return eventStartMinutes >= slotStart && eventStartMinutes < slotEnd
                    })
                    .map((event) => (
                      <div
                        key={`event-${event.id}-day-${dayIndex}-slot-${slotIndex}`}
                        data-testid={`event-bar-${event.id}`}
                        className={`calendar-event-bar absolute text-white font-medium cursor-pointer ${
                          event.Available 
                            ? 'bg-emerald-500 hover:bg-emerald-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                        style={{
                          ...getEventStyle(event, slotIndex),
                          left: '2px',
                          right: '2px',
                          width: 'calc(100% - 4px)',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEventClick(event)
                        }}
                        onMouseEnter={() => setHoveredEvent(event.id || null)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        <div className="truncate p-1 text-xs">
                          {formatJSTTime(new Date(event.StartTime))} - {formatJSTTime(new Date(event.EndTime))}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* 編集モーダル */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div data-testid="edit-modal" className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">タイムスロット編集</h3>
              <button 
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始時刻
                </label>
                <input
                  type="datetime-local"
                  value={editingEvent.startTime}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  終了時刻
                </label>
                <input
                  type="datetime-local"
                  value={editingEvent.endTime}
                  onChange={(e) => setEditingEvent(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={editingEvent.available}
                    onChange={(e) => setEditingEvent(prev => prev ? { ...prev, available: e.target.checked } : null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">利用可能</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8">
              <button
                onClick={handleEditSave}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                保存
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}