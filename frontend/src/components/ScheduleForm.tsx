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
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-2xl border-0 ring-1 ring-slate-200/50">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">スケジュールが作成されました</h1>
        
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
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-2xl border-0 ring-1 ring-slate-200/50">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">スケジュール作成</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">時間スロット</h3>
          
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
          <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 mb-2">
            コメント
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all duration-200 text-sm"
            rows={3}
            placeholder="スケジュールについてのコメントを入力してください"
          />
        </div>

        {error && (
          <div className="text-red-700 text-sm bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-sm"
        >
          {isLoading ? '作成中...' : '作成'}
        </button>
      </form>
    </div>
  )
}