interface WeekViewProps {
  currentDate?: Date
}

export default function WeekView({ currentDate = new Date() }: WeekViewProps) {
  return (
    <div data-testid="week-view" className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">週表示</h2>
      <p className="text-gray-600">週表示コンポーネント（実装予定）</p>
    </div>
  )
}