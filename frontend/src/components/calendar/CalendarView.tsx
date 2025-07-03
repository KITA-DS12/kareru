import { useState } from 'react'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarViewProps {
  currentDate?: Date
  onDateSelect?: (date: Date) => void
}

export default function CalendarView({ currentDate = new Date(), onDateSelect }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const viewModeButtons: Array<{ mode: ViewMode; label: string }> = [
    { mode: 'month', label: '月' },
    { mode: 'week', label: '週' },
    { mode: 'day', label: '日' },
  ]

  const getButtonClasses = (mode: ViewMode) => {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors'
    if (viewMode === mode) {
      return `${baseClasses} bg-blue-600 text-white`
    }
    return `${baseClasses} bg-gray-200 text-gray-700 hover:bg-gray-300`
  }

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'week':
        return <WeekView currentDate={currentDate} />
      case 'day':
        return <DayView currentDate={currentDate} />
      default:
        return <MonthView currentDate={currentDate} onDateSelect={onDateSelect} />
    }
  }

  return (
    <div className="space-y-6">
      {/* 表示モード切り替えボタン */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
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
      {renderCurrentView()}
    </div>
  )
}