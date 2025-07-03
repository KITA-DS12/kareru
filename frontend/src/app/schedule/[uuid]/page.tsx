interface Props {
  params: {
    uuid: string
  }
}

export default function SchedulePage({ params }: Props) {
  return (
    <div data-testid="schedule-page">
      <h1>スケジュール表示</h1>
      <p>UUID: {params.uuid}</p>
    </div>
  )
}