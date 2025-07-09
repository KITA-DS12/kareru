import { render, screen, fireEvent } from '@testing-library/react'
import CalendarGrid from './CalendarGrid'
import { Schedule, TimeSlot } from '@/types/schedule'

const mockSchedule: Schedule = {
  ID: 'test-schedule',
  EditToken: 'test-token',
  timeSlots: [
    {
      id: 'slot-1',
      StartTime: '2024-01-01T10:00:00',
      EndTime: '2024-01-01T11:30:00',
      Available: true
    }
  ] as TimeSlot[],
  ExpiresAt: '2024-01-08T00:00:00'
}

const mockOnRemoveTimeSlot = jest.fn()

describe('CalendarGrid - 削除モーダル表示機能', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('イベントバークリック時に削除モーダルが表示される', () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    const eventBar = screen.getByTestId('event-bar-slot-1')
    fireEvent.click(eventBar)

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })

  it('削除実行後にモーダルが閉じる', () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    const eventBar = screen.getByTestId('event-bar-slot-1')
    fireEvent.click(eventBar)

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
  })

  it('削除実行後に該当タイムスロットが削除される', () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    const eventBar = screen.getByTestId('event-bar-slot-1')
    fireEvent.click(eventBar)

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(mockOnRemoveTimeSlot).toHaveBeenCalledWith('slot-1')
  })

  it('削除処理が既存のuseScheduleFormのremoveTimeSlot関数を呼び出す', () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    const eventBar = screen.getByTestId('event-bar-slot-1')
    fireEvent.click(eventBar)

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(mockOnRemoveTimeSlot).toHaveBeenCalledWith('slot-1')
  })
})