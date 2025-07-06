import React from 'react'

interface WeekNavigationProps {
  onPreviousWeek: () => void
  onCurrentWeek: () => void
  onNextWeek: () => void
  getWeekRange: () => { start: string; end: string }
}

export default function WeekNavigation({
  onPreviousWeek,
  onCurrentWeek,
  onNextWeek,
  getWeekRange
}: WeekNavigationProps) {
  const weekRange = getWeekRange()

  return (
    <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousWeek}
            className="w-14 h-12 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-500 font-bold text-lg dark:bg-slate-700 dark:hover:bg-slate-800 dark:border-slate-600"
            aria-label="前の週"
          >
            &lt;
          </button>
          
          <button
            onClick={onCurrentWeek}
            className="px-8 h-12 text-sm bg-slate-700 text-white hover:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-600 font-medium flex items-center justify-center dark:bg-slate-800 dark:hover:bg-slate-900 dark:border-slate-700"
          >
            今週
          </button>
          
          <button
            onClick={onNextWeek}
            className="w-14 h-12 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-500 font-bold text-lg dark:bg-slate-700 dark:hover:bg-slate-800 dark:border-slate-600"
            aria-label="次の週"
          >
            &gt;
          </button>
        </div>
        
        <div className="text-sm text-gray-200">
          {weekRange.start} - {weekRange.end}
        </div>
      </div>
    </div>
  )
}