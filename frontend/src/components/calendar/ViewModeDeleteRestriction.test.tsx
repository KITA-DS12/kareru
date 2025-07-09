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

describe('CalendarGrid - スケジュール表示モードでの削除無効化', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('スケジュール表示モードでは削除モーダルが表示されない', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        mode="view"
      />
    )

    // イベントバーが表示されるまで待つ
    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])
    
    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
  })

  it('作成モードでは削除モーダルが表示される', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        mode="create"
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])
    
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })

  it('編集モードでは削除モーダルが表示される', async () => {
    render(
      <CalendarGrid
        schedule={mockSchedule}
        mode="edit"
        onRemoveTimeSlot={mockOnRemoveTimeSlot}
      />
    )

    await waitFor(() => {
      const eventBars = screen.getAllByTestId(/event-bar-/)
      expect(eventBars.length).toBeGreaterThan(0)
    })
    
    const eventBars = screen.getAllByTestId(/event-bar-/)
    fireEvent.click(eventBars[0])
    
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })

  it('モードが未指定の場合は削除モーダルが表示される（デフォルト動作）', async () => {
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
    
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
  })
})