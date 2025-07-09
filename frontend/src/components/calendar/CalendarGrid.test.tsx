import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CalendarGrid from './CalendarGrid'
import { Schedule, TimeSlot } from '@/types/schedule'

const mockSchedule: Schedule = {
  ID: 'test-schedule',
  EditToken: 'test-token',
  timeSlots: [
    {
      id: 'slot-1',
      StartTime: '2024-07-09T10:00:00',
      EndTime: '2024-07-09T11:30:00',
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

  it('イベントバークリック時に削除モーダルが表示される', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    // イベントバーが表示されるまで待つ
    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])
    
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })

  it('削除実行後にモーダルが閉じる', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
  })

  it('削除実行後に該当タイムスロットが削除される', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(mockOnRemoveTimeSlot).toHaveBeenCalledWith('slot-1')
  })

  it('削除処理が既存のuseScheduleFormのremoveTimeSlot関数を呼び出す', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])

    const deleteButton = screen.getByText('削除')
    fireEvent.click(deleteButton)

    expect(mockOnRemoveTimeSlot).toHaveBeenCalledWith('slot-1')
  })
})