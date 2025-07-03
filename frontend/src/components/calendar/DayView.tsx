interface DayViewProps {
  currentDate?: Date
}

export default function DayView({ currentDate = new Date() }: DayViewProps) {
  return (
    <div data-testid="day-view" className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">日表示</h2>
      <p className="text-gray-600">日表示コンポーネント（実装予定）</p>
    </div>
  )
}