import React, { useState } from 'react'
import { Schedule, TimeSlot } from '../../types/schedule'

interface WeekViewProps {
  currentDate?: Date
  schedule?: Schedule
}

export default function WeekView({ currentDate = new Date(), schedule }: WeekViewProps) {
  const [viewDate, setViewDate] = useState(currentDate)
  
  const today = new Date()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const hours = Array.from({ length: 9 }, (_, i) => i + 9) // 9:00-17:00
  
  const getWeekStart = (date: Date): Date => {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    return start
  }
  
  const getWeekDates = (): Date[] => {
    const weekStart = getWeekStart(viewDate)
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    })
  }
  
  const weekDates = getWeekDates()
  
  const goToPreviousWeek = () => {
    const newDate = new Date(viewDate)
    newDate.setDate(viewDate.getDate() - 7)
    setViewDate(newDate)
  }
  
  const goToNextWeek = () => {
    const newDate = new Date(viewDate)
    newDate.setDate(viewDate.getDate() + 7)
    setViewDate(newDate)
  }
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }
  
  const getTimeSlotsForDateTime = (date: Date, hour: number): TimeSlot[] => {
    if (!schedule?.timeSlots) return []
    
    return schedule.timeSlots.filter(slot => {
      const slotStart = new Date(slot.StartTime)
      
      // 同じ日付で、スロットの開始時間が指定された時間帯に含まれているかチェック
      const isSameDate = slotStart.getFullYear() === date.getFullYear() &&
                        slotStart.getMonth() === date.getMonth() &&
                        slotStart.getDate() === date.getDate()
      
      const slotHour = slotStart.getHours()
      
      return isSameDate && slotHour === hour
    })
  }
  
  const renderScheduleBlock = (date: Date, hour: number) => {
    const slots = getTimeSlotsForDateTime(date, hour)
    if (slots.length === 0) return null
    
    return slots.map((slot) => (
      <div
        key={slot.id}
        data-testid={`schedule-block-${slot.id}`}
        className={`absolute inset-x-1 inset-y-0.5 rounded text-xs p-1 ${
          slot.Available ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        }`}
      >
        {new Date(slot.StartTime).toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    ))
  }
  
  return (
    <div data-testid="week-view" className="bg-white rounded-lg shadow p-6">
      {/* ヘッダー: 週ナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <button
          data-testid="prev-week"
          onClick={goToPreviousWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {weekDates[0].getFullYear()}年{weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 〜 {weekDates[6].getDate()}日
        </h2>
        
        <button
          data-testid="next-week"
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        <div className="h-8"></div> {/* 時間列のためのスペース */}
        {weekDates.map((date, index) => (
          <div
            key={date.toISOString()}
            data-testid={`date-${date.getDate()}`}
            className={`h-8 flex flex-col items-center justify-center text-sm ${
              isToday(date) ? 'bg-blue-600 text-white font-semibold rounded' : 'text-gray-700'
            }`}
          >
            <div>{weekdays[index]}</div>
            <div className="text-lg">{date.getDate()}</div>
          </div>
        ))}
      </div>
      
      {/* タイムグリッド */}
      <div data-testid="time-grid" className="grid grid-cols-8 gap-1 min-w-max overflow-x-auto">
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* 時間ラベル */}
            <div className="h-12 sm:h-16 flex items-center justify-center text-xs sm:text-sm text-gray-500 border-r min-w-16">
              {String(hour).padStart(2, '0')}:00
            </div>
            
            {/* 各曜日の時間スロット */}
            {weekDates.map((date) => (
              <div
                key={`${date.toISOString()}-${hour}`}
                className="h-12 sm:h-16 border border-gray-200 relative hover:bg-gray-50 min-w-16"
              >
                {renderScheduleBlock(date, hour)}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}