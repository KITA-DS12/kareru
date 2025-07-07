import { useState, useMemo } from 'react'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'
import { Schedule } from '../../types/schedule'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarViewProps {
  currentDate?: Date
  onDateSelect?: (date: Date) => void
  schedule?: Schedule
}

export default function CalendarView({ currentDate = new Date(), onDateSelect, schedule }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const viewModeButtons: Array<{ mode: ViewMode; label: string }> = useMemo(() => [
    { mode: 'month', label: '月' },
    { mode: 'week', label: '週' },
    { mode: 'day', label: '日' },
  ], [])

  const getButtonClasses = useMemo(() => (mode: ViewMode) => {
    const baseClasses = 'px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors'
    if (viewMode === mode) {
      return `${baseClasses} bg-blue-600 text-white`
    }
    return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500`
  }, [viewMode])

  const renderCurrentView = useMemo(() => {
    switch (viewMode) {
      case 'week':
        return <WeekView currentDate={currentDate} schedule={schedule} />
      case 'day':
        return <DayView currentDate={currentDate} />
      default:
        return <MonthView currentDate={currentDate} onDateSelect={onDateSelect} schedule={schedule} />
    }
  }, [viewMode, currentDate, onDateSelect, schedule])

  return (
    <div className="space-y-6">
      {/* 表示モード切り替えボタン */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-amber-300 p-1 bg-amber-100 dark:border-amber-600 dark:bg-amber-800">
          {viewModeButtons.map(({ mode, label }) => (
            <button
              key={mode}
              data-testid={`view-mode-${mode}`}
              onClick={() => setViewMode(mode)}
              className={getButtonClasses(mode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 現在の表示モードのコンポーネント */}
      <div className="overflow-x-auto">
        {renderCurrentView}
      </div>
    </div>
  )
}