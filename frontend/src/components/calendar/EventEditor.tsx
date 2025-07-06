import React from 'react'

interface EditingEvent {
  id: string
  startTime: string
  endTime: string
}

interface EventEditorProps {
  editingEvent: EditingEvent
  onSave: () => void
  onDelete: () => void
  onClose: () => void
  onUpdate: (updates: Partial<EditingEvent>) => void
}

export default function EventEditor({
  editingEvent,
  onSave,
  onDelete,
  onClose,
  onUpdate
}: EventEditorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div data-testid="edit-modal" className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-100">タイムスロット編集</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-white mb-2">
              開始時刻
            </label>
            <input
              id="start-time"
              type="datetime-local"
              value={editingEvent.startTime}
              onChange={(e) => onUpdate({ startTime: e.target.value })}
              className="w-full p-3 border border-gray-600 rounded-md bg-gray-750 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 focus:shadow-lg"
            />
          </div>
          
          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-white mb-2">
              終了時刻
            </label>
            <input
              id="end-time"
              type="datetime-local"
              value={editingEvent.endTime}
              onChange={(e) => onUpdate({ endTime: e.target.value })}
              className="w-full p-3 border border-gray-600 rounded-md bg-gray-750 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 focus:shadow-lg"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onSave}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            保存
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}