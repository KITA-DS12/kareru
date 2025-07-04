import { render, screen } from '@testing-library/react'
import MonthView from './MonthView'
import { Schedule, TimeSlot } from '../../types/schedule'

describe('MonthView Component', () => {
  const mockDate = new Date('2025-07-15') // 2025年7月15日（火曜日）
  
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render current month and year', () => {
    render(<MonthView />)
    expect(screen.getByText('2025年7月')).toBeInTheDocument()
  })

  it('should render weekday headers', () => {
    render(<MonthView />)
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
    expect(screen.getByText('金')).toBeInTheDocument()
    expect(screen.getByText('土')).toBeInTheDocument()
  })

  it('should render current month dates', () => {
    render(<MonthView />)
    // 7月の日付をテスト（test-idを使用して特定）
    expect(screen.getByTestId('date-1')).toBeInTheDocument()
    expect(screen.getByTestId('date-15')).toBeInTheDocument()
    expect(screen.getByTestId('date-31')).toBeInTheDocument()
  })

  it('should highlight today date', () => {
    render(<MonthView />)
    const todayCell = screen.getByTestId('date-15')
    expect(todayCell).toHaveClass('bg-blue-600') // 今日の日付がハイライトされる
  })

  it('should render previous and next month navigation', () => {
    render(<MonthView />)
    expect(screen.getByTestId('prev-month')).toBeInTheDocument()
    expect(screen.getByTestId('next-month')).toBeInTheDocument()
  })

  it('should display previous month dates in muted style', () => {
    render(<MonthView />)
    // 6月の最後の日付（6月29日、30日）が薄く表示される
    const prevMonthDate = screen.getByTestId('prev-month-30')
    expect(prevMonthDate).toHaveClass('text-gray-400')
  })

  it('should display next month dates in muted style', () => {
    render(<MonthView />)
    // 8月の最初の日付が薄く表示される
    const nextMonthDate = screen.getByTestId('next-month-1')
    expect(nextMonthDate).toHaveClass('text-gray-400')
  })

  it('should have proper grid layout', () => {
    render(<MonthView />)
    const calendarGrid = screen.getByTestId('calendar-grid')
    expect(calendarGrid).toHaveClass('grid-cols-7') // 7列グリッド
  })

  describe('Schedule Display', () => {
    const mockTimeSlots: TimeSlot[] = [
      {
        id: '1',
        StartTime: '2025-07-15T10:00:00Z',
        EndTime: '2025-07-15T11:00:00Z',
        Available: true
      },
      {
        id: '2',
        StartTime: '2025-07-15T14:00:00Z',
        EndTime: '2025-07-15T15:30:00Z',
        Available: false
      },
      {
        id: '3',
        StartTime: '2025-07-20T09:00:00Z',
        EndTime: '2025-07-20T17:00:00Z',
        Available: true
      }
    ]

    const mockSchedule: Schedule = {
      id: 'test-schedule',
      comment: 'テストスケジュール',
      timeSlots: mockTimeSlots
    }

    it('should display schedule indicators on dates with bookings', () => {
      render(<MonthView schedule={mockSchedule} />)
      
      const july15Cell = screen.getByTestId('date-15')
      const july20Cell = screen.getByTestId('date-20')
      
      expect(july15Cell.querySelector('[data-testid="schedule-indicator"]')).toBeInTheDocument()
      expect(july20Cell.querySelector('[data-testid="schedule-indicator"]')).toBeInTheDocument()
    })

    it('should not display indicators on dates without bookings', () => {
      render(<MonthView schedule={mockSchedule} />)
      
      const july10Cell = screen.getByTestId('date-10')
      expect(july10Cell.querySelector('[data-testid="schedule-indicator"]')).not.toBeInTheDocument()
    })

    it('should show different colors for available and unavailable time slots', () => {
      render(<MonthView schedule={mockSchedule} />)
      
      const july15Cell = screen.getByTestId('date-15')
      const indicators = july15Cell.querySelectorAll('[data-testid="schedule-indicator"]')
      
      expect(indicators).toHaveLength(2)
      expect(indicators[0]).toHaveClass('bg-green-500')
      expect(indicators[1]).toHaveClass('bg-red-500')
    })

    it('should handle empty schedule gracefully', () => {
      const emptySchedule: Schedule = {
        id: 'empty',
        comment: 'Empty schedule',
        timeSlots: []
      }
      
      render(<MonthView schedule={emptySchedule} />)
      
      const july15Cell = screen.getByTestId('date-15')
      expect(july15Cell.querySelector('[data-testid="schedule-indicator"]')).not.toBeInTheDocument()
    })

    it('should handle undefined schedule gracefully', () => {
      render(<MonthView />)
      
      const july15Cell = screen.getByTestId('date-15')
      expect(july15Cell.querySelector('[data-testid="schedule-indicator"]')).not.toBeInTheDocument()
    })
  })
})