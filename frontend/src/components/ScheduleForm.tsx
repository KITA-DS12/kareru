'use client'

import { useScheduleForm } from '../hooks/useScheduleForm'
import CalendarGrid from './calendar/CalendarGrid'

export default function ScheduleForm() {
  const {
    comment,
    setComment,
    timeSlots,
    error,
    isLoading,
    successData,
    addTimeSlot,
    addTimeSlots,
    addTimeSlotsWithMerge,
    removeTimeSlot,
    updateTimeSlot,
    submitForm,
  } = useScheduleForm()

  // CalendarGrid用のタイムスロット変換
  const convertToCalendarTimeSlots = () => {
    return timeSlots.map((slot, index) => ({
      id: slot.id,
      StartTime: slot.startTime,
      EndTime: slot.endTime,
      Available: true // 作成時は常に利用可能
    }))
  }

  // カレンダーからのタイムスロット作成
  const handleCreateTimeSlotFromCalendar = (timeSlot: { StartTime: string; EndTime: string }) => {
    addTimeSlot(timeSlot.StartTime, timeSlot.EndTime)
  }

  // カレンダーからの複数タイムスロット作成
  const handleCreateTimeSlotsFromCalendar = (timeSlots: Array<{ StartTime: string; EndTime: string }>) => {
    const formattedSlots = timeSlots.map(slot => ({
      startTime: slot.StartTime,
      endTime: slot.EndTime
    }))
    addTimeSlots(formattedSlots)
  }

  // カレンダーからの重複時マージ対応タイムスロット作成
  const handleCreateTimeSlotsWithMergeFromCalendar = (timeSlots: Array<{ StartTime: string; EndTime: string }>) => {
    const formattedSlots = timeSlots.map(slot => ({
      startTime: slot.StartTime,
      endTime: slot.EndTime
    }))
    addTimeSlotsWithMerge(formattedSlots)
  }

  // 仮のスケジュールオブジェクト作成
  const previewSchedule = {
    id: 'preview',
    comment: comment || 'プレビュー',
    timeSlots: convertToCalendarTimeSlots(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm()
  }

  const generateUrl = (id: string) => {
    return `${window.location.origin}/schedule/${id}`
  }

  const generateEditUrl = (editToken: string) => {
    return `${window.location.origin}/edit/${editToken}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('URLをコピーしました')
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (successData) {
    const scheduleUrl = generateUrl(successData.id)
    const editUrl = generateEditUrl(successData.editToken)
    
    return (
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-4">スケジュールが作成されました</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 mb-4">スケジュールが正常に作成されました。</p>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">📋 公開URL（共有用）:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scheduleUrl}
                  readOnly
                  className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => copyToClipboard(scheduleUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  コピー
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">✏️ 編集URL（管理用）:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editUrl}
                  readOnly
                  className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={() => copyToClipboard(editUrl)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  コピー
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">⚠️ この編集URLは他人と共有しないでください</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
        >
          新しいスケジュールを作成
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-4">スケジュール作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">時間スロット</h3>
          
          {/* カレンダーUI */}
          <div className="mb-4">
            <CalendarGrid 
              schedule={previewSchedule}
              onCreateTimeSlot={handleCreateTimeSlotFromCalendar}
              onCreateTimeSlots={handleCreateTimeSlotsFromCalendar}
              onCreateTimeSlotsWithMerge={handleCreateTimeSlotsWithMergeFromCalendar}
              showWeekNavigation={true}
            />
          </div>

        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            コメント
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            rows={2}
            placeholder="スケジュールについてのコメント"
          />
        </div>

        {error && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? '作成中...' : '作成'}
        </button>
      </form>
    </div>
  )
}