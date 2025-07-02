'use client'

import { useState } from 'react'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

export default function ScheduleForm() {
  const [comment, setComment] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState('')

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '',
      endTime: ''
    }
    setTimeSlots([...timeSlots, newSlot])
  }

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id))
  }

  const updateTimeSlot = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (timeSlots.length === 0) {
      setError('時間スロットを追加してください')
      return
    }

    // バリデーション
    for (const slot of timeSlots) {
      if (!slot.startTime || !slot.endTime) {
        setError('全ての時間スロットを入力してください')
        return
      }
      if (slot.startTime >= slot.endTime) {
        setError('開始時刻は終了時刻より前に設定してください')
        return
      }
    }

    // フォーム送信処理（後で実装）
    console.log('スケジュール作成:', { comment, timeSlots })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">スケジュール作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            コメント
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="スケジュールについてのコメントを入力してください"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">時間スロット</h3>
          
          {timeSlots.map((slot) => (
            <div key={slot.id} className="flex gap-4 items-center mb-4 p-4 border border-gray-200 rounded-md">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">開始時刻</label>
                <input
                  type="datetime-local"
                  value={slot.startTime}
                  onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">終了時刻</label>
                <input
                  type="datetime-local"
                  value={slot.endTime}
                  onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTimeSlot(slot.id)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                削除
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addTimeSlot}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            時間スロットを追加
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          作成
        </button>
      </form>
    </div>
  )
}