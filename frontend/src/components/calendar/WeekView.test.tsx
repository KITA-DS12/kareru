import { render, screen, fireEvent } from '@testing-library/react'
import WeekView from './WeekView'
import { Schedule, TimeSlot } from '../../types/schedule'

describe('WeekView Component', () => {
  const mockDate = new Date('2025-07-15') // 2025年7月15日（火曜日）
  
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render week view container', () => {
    render(<WeekView />)
    expect(screen.getByTestId('week-view')).toBeInTheDocument()
  })

  it('should render weekday headers', () => {
    render(<WeekView />)
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.getByText('木')).toBeInTheDocument()
    expect(screen.getByText('金')).toBeInTheDocument()
    expect(screen.getByText('土')).toBeInTheDocument()
  })

  it('should display dates for current week', () => {
    render(<WeekView />)
    // 2025年7月15日の週（7月13日〜19日）
    expect(screen.getByTestId('date-13')).toBeInTheDocument()
    expect(screen.getByTestId('date-15')).toBeInTheDocument() // 今日
    expect(screen.getByTestId('date-19')).toBeInTheDocument()
  })

  it('should highlight today date', () => {
    render(<WeekView />)
    const todayCell = screen.getByTestId('date-15')
    expect(todayCell).toHaveClass('bg-blue-600')
  })

  it('should render time grid with hourly slots', () => {
    render(<WeekView />)
    expect(screen.getByTestId('time-grid')).toBeInTheDocument()
    expect(screen.getByText('09:00')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(screen.getByText('17:00')).toBeInTheDocument()
  })

  it('should navigate to previous week', () => {
    render(<WeekView />)
    const prevButton = screen.getByTestId('prev-week')
    fireEvent.click(prevButton)
    
    // 前週（7月6日〜12日）の日付が表示される
    expect(screen.getByTestId('date-6')).toBeInTheDocument()
    expect(screen.getByTestId('date-12')).toBeInTheDocument()
  })

  it('should navigate to next week', () => {
    render(<WeekView />)
    const nextButton = screen.getByTestId('next-week')
    fireEvent.click(nextButton)
    
    // 次週（7月20日〜26日）の日付が表示される
    expect(screen.getByTestId('date-20')).toBeInTheDocument()
    expect(screen.getByTestId('date-26')).toBeInTheDocument()
  })

  describe('Schedule Display', () => {
    const mockTimeSlots: TimeSlot[] = [
      {
        id: '1',
        StartTime: '2025-07-15T10:00:00',
        EndTime: '2025-07-15T11:00:00',
        Available: true
      },
      {
        id: '2', 
        StartTime: '2025-07-15T14:00:00',
        EndTime: '2025-07-15T15:30:00',
        Available: false
      }
    ]

    const mockSchedule: Schedule = {
      id: 'test-schedule',
      comment: 'テストスケジュール',
      timeSlots: mockTimeSlots
    }

    it('should display schedule blocks on time grid', () => {
      render(<WeekView schedule={mockSchedule} />)
      
      expect(screen.getByTestId('schedule-block-1')).toBeInTheDocument()
      expect(screen.getByTestId('schedule-block-2')).toBeInTheDocument()
    })

    it('should show different colors for available and unavailable slots', () => {
      render(<WeekView schedule={mockSchedule} />)
      
      const availableBlock = screen.getByTestId('schedule-block-1')
      const unavailableBlock = screen.getByTestId('schedule-block-2')
      
      expect(availableBlock).toHaveClass('bg-green-200')
      expect(unavailableBlock).toHaveClass('bg-red-200')
    })

    it('should handle empty schedule gracefully', () => {
      const emptySchedule: Schedule = {
        id: 'empty',
        comment: 'Empty schedule', 
        timeSlots: []
      }
      
      render(<WeekView schedule={emptySchedule} />)
      expect(screen.queryByTestId('schedule-block-1')).not.toBeInTheDocument()
    })
  })
})