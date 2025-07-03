import { render, screen } from '@testing-library/react'
import MonthView from './MonthView'

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
    // 7月の日付をいくつかテスト
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
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
})