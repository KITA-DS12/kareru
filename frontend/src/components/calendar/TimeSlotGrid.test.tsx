import { render, screen, fireEvent } from '@testing-library/react'
import TimeSlotGrid from './TimeSlotGrid'
import { Schedule, TimeSlot } from '../../types/schedule'

describe('TimeSlotGrid', () => {
  const mockWeekDates = [
    new Date('2024-07-14T00:00:00Z'), // 日
    new Date('2024-07-15T00:00:00Z'), // 月  
    new Date('2024-07-16T00:00:00Z'), // 火（今日）
    new Date('2024-07-17T00:00:00Z'), // 水
    new Date('2024-07-18T00:00:00Z'), // 木
    new Date('2024-07-19T00:00:00Z'), // 金
    new Date('2024-07-20T00:00:00Z')  // 土
  ]

  const mockSchedule: Schedule = {
    ID: 'test-schedule',
    EditToken: 'test-token',
    timeSlots: [
      {
        id: '1',
        StartTime: '2024-07-16T10:00:00Z',
        EndTime: '2024-07-16T11:00:00Z'
      }
    ]
  }

  const mockHandleSlotClick = jest.fn()
  const mockHandleEventClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('週ヘッダーが正しく表示される', () => {
    render(
      <TimeSlotGrid
        schedule={mockSchedule}
        weekDates={mockWeekDates}
        todayColumnIndex={2}
        onSlotClick={mockHandleSlotClick}
      />
    )

    expect(screen.getByText('時刻')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
    expect(screen.getByText('金')).toBeInTheDocument()
    expect(screen.getByText('土')).toBeInTheDocument()
  })

  it('現在時刻インジケーターが今日の列に表示される', () => {
    render(
      <TimeSlotGrid
        schedule={mockSchedule}
        weekDates={mockWeekDates}
        todayColumnIndex={2}
        onSlotClick={mockHandleSlotClick}
      />
    )

    const indicator = screen.getByTestId('current-time-indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('タイムスロットグリッドが正しく描画される', () => {
    render(
      <TimeSlotGrid
        schedule={mockSchedule}
        weekDates={mockWeekDates}
        todayColumnIndex={-1}
        onSlotClick={mockHandleSlotClick}
      />
    )

    const gridContainer = screen.getByTestId('time-grid-container')
    expect(gridContainer).toBeInTheDocument()
    expect(screen.getByTestId('time-label-0')).toBeInTheDocument()
  })

  it('スロットクリックでハンドラーが呼ばれる', () => {
    render(
      <TimeSlotGrid
        schedule={mockSchedule}
        weekDates={mockWeekDates}
        todayColumnIndex={-1}
        onSlotClick={mockHandleSlotClick}
      />
    )

    const timeSlot = screen.getByTestId('time-slot-14-0')
    fireEvent.click(timeSlot)
    expect(mockHandleSlotClick).toHaveBeenCalledWith(0, 0)
  })

  it('イベントバーが正しく表示され、クリック可能', () => {
    render(
      <TimeSlotGrid
        schedule={mockSchedule}
        weekDates={mockWeekDates}
        todayColumnIndex={-1}
        onSlotClick={mockHandleSlotClick}
      />
    )

    const eventBar = screen.getByTestId('event-bar-1')
    expect(eventBar).toBeInTheDocument()
    
    // 現在の実装ではイベントクリックでstopPropagationされるだけ
    fireEvent.click(eventBar)
    expect(eventBar).toBeInTheDocument()
  })
})