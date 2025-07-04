import { useState } from 'react'
import { Schedule, TimeSlot } from '../../types/schedule'

interface MonthViewProps {
  currentDate?: Date
  onDateSelect?: (date: Date) => void
  schedule?: Schedule
}

export default function MonthView({ currentDate = new Date(), onDateSelect, schedule }: MonthViewProps) {
  const [viewDate, setViewDate] = useState(currentDate)
  
  const today = new Date()
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  
  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // カレンダーグリッドの開始日（前月の日曜日から）
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay())
  
  // カレンダーグリッドの終了日（次月の土曜日まで）
  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()))
  
  // カレンダーに表示する日付の配列を生成
  const dates: Date[] = []
  const currentDate_ = new Date(startDate)
  while (currentDate_ <= endDate) {
    dates.push(new Date(currentDate_))
    currentDate_.setDate(currentDate_.getDate() + 1)
  }
  
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  
  const goToPreviousMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }
  
  const isPreviousMonth = (date: Date) => {
    return date.getMonth() === (month === 0 ? 11 : month - 1)
  }
  
  const isNextMonth = (date: Date) => {
    return date.getMonth() === (month === 11 ? 0 : month + 1)
  }
  
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date)
    }
  }
  
  const getDateTestId = (date: Date) => {
    if (isPreviousMonth(date)) {
      return `prev-month-${date.getDate()}`
    }
    if (isNextMonth(date)) {
      return `next-month-${date.getDate()}`
    }
    return `date-${date.getDate()}`
  }

  const getTimeSlotsForDate = (date: Date): TimeSlot[] => {
    if (!schedule?.timeSlots) return []
    
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    
    return schedule.timeSlots.filter(slot => {
      const slotDate = new Date(slot.StartTime)
      return slotDate.getFullYear() === year && 
             slotDate.getMonth() === month && 
             slotDate.getDate() === day
    })
  }

  const renderScheduleIndicators = (date: Date) => {
    const timeSlots = getTimeSlotsForDate(date)
    if (timeSlots.length === 0) return null

    return (
      <div className="flex space-x-1 mt-1">
        {timeSlots.map((slot, index) => (
          <div
            key={slot.id || index}
            data-testid="schedule-indicator"
            className={`w-2 h-1 rounded-full ${
              slot.Available ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div data-testid="month-view" className="bg-white rounded-lg shadow p-6">
      {/* ヘッダー: 月/年とナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <button
          data-testid="prev-month"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {year}年{month + 1}月
        </h2>
        
        <button
          data-testid="next-month"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
          >
            {weekday}
          </div>
        ))}
      </div>
      
      {/* カレンダーグリッド */}
      <div data-testid="calendar-grid" className="grid grid-cols-7 gap-1 min-w-0">
        {dates.map((date) => (
          <button
            key={date.toISOString()}
            data-testid={getDateTestId(date)}
            onClick={() => handleDateClick(date)}
            className={`
              h-10 sm:h-14 flex flex-col items-center justify-start pt-1 text-xs sm:text-sm rounded-md transition-colors relative min-w-0
              ${isToday(date) 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'hover:bg-gray-100'
              }
              ${!isCurrentMonth(date) 
                ? 'text-gray-400' 
                : 'text-gray-900'
              }
            `}
          >
            <span>{date.getDate()}</span>
            {renderScheduleIndicators(date)}
          </button>
        ))}
      </div>
    </div>
  )
}