import React from 'react'
import { DURATION_MODES } from '../../constants'

type DurationMode = '30min' | '1h' | '3h' | '1day'

interface DurationSelectorProps {
  currentMode: DurationMode
  onDurationChange: (mode: DurationMode) => void
}

export default function DurationSelector({
  currentMode,
  onDurationChange
}: DurationSelectorProps) {
  const modes: DurationMode[] = [
    DURATION_MODES.THIRTY_MINUTES,
    DURATION_MODES.ONE_HOUR,
    DURATION_MODES.THREE_HOURS,
    DURATION_MODES.ONE_DAY
  ]

  const handleModeChange = (mode: DurationMode, event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    onDurationChange(mode)
  }

  return (
    <div className="px-4 py-2 border-b border-gray-700 bg-gray-800">
      <div className="flex items-center justify-end">
        <div className="flex space-x-1">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={(e) => handleModeChange(mode, e)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                currentMode === mode
                  ? 'bg-slate-700 text-white shadow-lg hover:shadow-xl border border-slate-600 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-900 dark:border-slate-700'
                  : 'bg-slate-500 text-white hover:text-white hover:bg-slate-600 border border-slate-400 shadow-md hover:shadow-lg dark:bg-slate-600 dark:hover:bg-slate-700 dark:border-slate-500'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}