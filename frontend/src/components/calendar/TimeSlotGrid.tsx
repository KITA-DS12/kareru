import React, { useRef, useMemo, useCallback } from 'react'
import { Schedule, TimeSlot } from '../../types/schedule'
import { utcToJST, formatJSTTime, getCurrentJSTMinutes } from '../../utils/timezone'

interface TimeSlotGridProps {
  schedule?: Schedule
  weekDates: Date[]
  todayColumnIndex: number
  onSlotClick: (dayIndex: number, slotIndex: number) => void
  onEventClick: (event: TimeSlot) => void
  hoveredEvent?: string | null
  onEventHover?: (eventId: string | null) => void
}

export default function TimeSlotGrid({
  schedule,
  weekDates,
  todayColumnIndex,
  onSlotClick,
  onEventClick,
  hoveredEvent,
  onEventHover
}: TimeSlotGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

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

  // 現在時刻の位置計算（日本時間）
  const getCurrentTimePosition = useCallback(() => {
    const minutes = getCurrentJSTMinutes()
    const slotIndex = Math.floor(minutes / 30)
    
    if (typeof document !== 'undefined') {
      const slotElement = document.querySelector(`[data-slot-index="${slotIndex}"]`)
      const containerRect = containerRef.current?.getBoundingClientRect()
      
      if (slotElement && containerRect) {
        const slotRect = slotElement.getBoundingClientRect()
        return slotRect.top - containerRect.top + (minutes % 30) * (32 / 30)
      }
    }
    
    return slotIndex * 32 + (minutes % 30) * (32 / 30)
  }, [])

  return (
    <div>
      {/* 週ヘッダー */}
      <div className="grid grid-cols-8 border-b border-gray-600 bg-gray-800">
        <div className="p-3 text-center font-medium text-gray-200 border-r border-gray-700 text-sm">
          時刻
        </div>
        {weekDates.map((date, index) => {
          const jstDate = utcToJST(date)
          const isToday = todayColumnIndex === index
          return (
            <div 
              key={`header-${date.toISOString()}`}
              className={`p-3 text-center border-r border-gray-700 ${
                isToday 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-200'
              }`}
            >
              <div className="text-xs font-medium">
                {weekdays[jstDate.getDay()]}
              </div>
              <div className="text-lg font-medium">
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
        className="relative overflow-y-auto h-[400px] bg-gray-900"
      >
        {/* 現在時刻インジケーター */}
        {todayColumnIndex !== -1 && (
          <div
            data-testid="current-time-indicator"
            className="absolute pointer-events-none z-20 bg-gradient-to-r from-red-500 to-red-600"
            style={{
              left: `${12.5 + todayColumnIndex * 12.5}%`,
              width: '12.5%',
              top: `${getCurrentTimePosition()}px`,
              height: '2px'
            }}
          >
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        )}
        
        {/* タイムスロット */}
        <div className="grid grid-cols-8">
          {timeSlots.map((slot, slotIndex) => (
            <React.Fragment key={`slot-${slotIndex}`}>
              {/* 時刻ラベル */}
              <div 
                className={`h-8 border-r border-gray-700 flex items-center justify-center text-xs font-medium text-gray-300 bg-gray-800 px-1 ${
                  slot.minute === 0 
                    ? 'border-b border-gray-600' 
                    : 'border-b border-gray-800'
                }`}
                data-testid={`time-label-${slotIndex}`}
              >
                <span className="truncate text-center">{slot.timeRange}</span>
              </div>
              
              {/* 各日のタイムスロット */}
              {weekDates.map((date, dayIndex) => (
                <div
                  key={`day-${date.toISOString()}-slot-${slotIndex}`}
                  data-testid={`time-slot-${date.getDate()}-${slotIndex}`}
                  data-day-index={dayIndex}
                  data-slot-index={slotIndex}
                  className={`calendar-time-slot h-8 border-r border-gray-700 cursor-pointer relative group transition-colors ${
                    slot.minute === 0 ? 'border-b border-gray-600' : 'border-b border-gray-800'
                  } ${
                    todayColumnIndex === dayIndex 
                      ? 'bg-gray-800 hover:bg-gray-700' 
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => onSlotClick(dayIndex, slotIndex)}
                >
                  {/* イベントバー（該当時間の場合のみ） */}
                  {schedule?.timeSlots
                    ?.filter(event => {
                      const eventDate = new Date(event.StartTime)
                      const jstEventDate = utcToJST(eventDate)
                      const jstSlotDate = utcToJST(weekDates[dayIndex])
                      
                      // 同じ日かつ該当スロット時間内の場合のみ表示
                      if (jstEventDate.toDateString() !== jstSlotDate.toDateString()) return false
                      
                      const eventStartMinutes = jstEventDate.getHours() * 60 + jstEventDate.getMinutes()
                      const slotStartMinutes = slot.hour * 60 + slot.minute
                      
                      return eventStartMinutes === slotStartMinutes
                    })
                    ?.map((event) => (
                    <div
                      key={`event-${event.id}-day-${dayIndex}-slot-${slotIndex}`}
                      data-testid={`event-bar-${event.id}`}
                      className={`calendar-event-bar absolute text-white font-medium cursor-pointer transition-colors border ${
                        event.Available 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-emerald-400'
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400'
                      }`}
                      style={{
                        top: '2px',
                        left: '2px',
                        right: '2px',
                        height: '24px',
                        borderRadius: '4px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      onMouseEnter={() => onEventHover?.(event.id || null)}
                      onMouseLeave={() => onEventHover?.(null)}
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
    </div>
  )
}