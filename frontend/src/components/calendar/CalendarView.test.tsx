import { render, screen, fireEvent } from '@testing-library/react'
import CalendarView from './CalendarView'

describe('CalendarView Component', () => {
  it('should render view mode toggle buttons', () => {
    render(<CalendarView />)
    
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('週')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
  })

  it('should default to month view', () => {
    render(<CalendarView />)
    
    const monthButton = screen.getByTestId('view-mode-month')
    expect(monthButton).toHaveClass('bg-blue-600') // アクティブ状態
    expect(monthButton).toHaveClass('text-white')
  })

  it('should switch to week view when week button is clicked', () => {
    render(<CalendarView />)
    
    const weekButton = screen.getByTestId('view-mode-week')
    fireEvent.click(weekButton)
    
    expect(weekButton).toHaveClass('bg-blue-600')
    expect(weekButton).toHaveClass('text-white')
    
    // 月ボタンがアクティブでなくなる
    const monthButton = screen.getByTestId('view-mode-month')
    expect(monthButton).not.toHaveClass('bg-blue-600')
  })

  it('should switch to day view when day button is clicked', () => {
    render(<CalendarView />)
    
    const dayButton = screen.getByTestId('view-mode-day')
    fireEvent.click(dayButton)
    
    expect(dayButton).toHaveClass('bg-blue-600')
    expect(dayButton).toHaveClass('text-white')
  })

  it('should display month view component by default', () => {
    render(<CalendarView />)
    
    // MonthViewコンポーネントが表示される
    expect(screen.getByTestId('month-view')).toBeInTheDocument()
  })

  it('should display week view component when week mode is selected', () => {
    render(<CalendarView />)
    
    const weekButton = screen.getByTestId('view-mode-week')
    fireEvent.click(weekButton)
    
    expect(screen.getByTestId('week-view')).toBeInTheDocument()
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument()
  })

  it('should display day view component when day mode is selected', () => {
    render(<CalendarView />)
    
    const dayButton = screen.getByTestId('view-mode-day')
    fireEvent.click(dayButton)
    
    expect(screen.getByTestId('day-view')).toBeInTheDocument()
    expect(screen.queryByTestId('month-view')).not.toBeInTheDocument()
  })

  it('should have proper button styling for active/inactive states', () => {
    render(<CalendarView />)
    
    const monthButton = screen.getByTestId('view-mode-month')
    const weekButton = screen.getByTestId('view-mode-week')
    
    // 初期状態：月がアクティブ
    expect(monthButton).toHaveClass('bg-blue-600', 'text-white')
    expect(weekButton).toHaveClass('bg-gray-200', 'text-gray-700')
    
    // 週に切り替え
    fireEvent.click(weekButton)
    expect(weekButton).toHaveClass('bg-blue-600', 'text-white')
    expect(monthButton).toHaveClass('bg-gray-200', 'text-gray-700')
  })

  it('should maintain view mode selection across re-renders', () => {
    const { rerender } = render(<CalendarView />)
    
    // 週表示に切り替え
    const weekButton = screen.getByTestId('view-mode-week')
    fireEvent.click(weekButton)
    
    rerender(<CalendarView />)
    
    // 週表示が維持される
    expect(screen.getByTestId('week-view')).toBeInTheDocument()
  })
})