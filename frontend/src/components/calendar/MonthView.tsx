import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface MonthViewProps {
  currentDate?: Date
  onDateSelect?: (date: Date) => void
}

export default function MonthView({ currentDate = new Date(), onDateSelect }: MonthViewProps) {
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
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* ヘッダー: 月/年とナビゲーション */}
      <div className="flex items-center justify-between mb-6">
        <button
          data-testid="prev-month"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {year}年{month + 1}月
        </h2>
        
        <button
          data-testid="next-month"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5" />
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
      <div data-testid="calendar-grid" className="grid grid-cols-7 gap-1">
        {dates.map((date) => (
          <button
            key={date.toISOString()}
            data-testid={getDateTestId(date)}
            onClick={() => handleDateClick(date)}
            className={`
              h-10 flex items-center justify-center text-sm rounded-md transition-colors
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
            {date.getDate()}
          </button>
        ))}
      </div>
    </div>
  )
}