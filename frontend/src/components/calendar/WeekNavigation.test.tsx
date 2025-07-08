import { render, screen, fireEvent } from '@testing-library/react'
import WeekNavigation from './WeekNavigation'

describe('WeekNavigation', () => {
  const mockGoToPreviousWeek = jest.fn()
  const mockGoToCurrentWeek = jest.fn()
  const mockGoToNextWeek = jest.fn()
  const mockGetWeekRange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // モックの戻り値を毎回再設定
    mockGetWeekRange.mockReturnValue({ start: '7月6日', end: '7月12日' })
  })

  it('週ナビゲーションボタンが表示される', () => {
    render(
      <WeekNavigation
        onPreviousWeek={mockGoToPreviousWeek}
        onCurrentWeek={mockGoToCurrentWeek}
        onNextWeek={mockGoToNextWeek}
        getWeekRange={mockGetWeekRange}
      />
    )

    expect(screen.getByLabelText('前の週')).toBeInTheDocument()
    expect(screen.getByText('今週')).toBeInTheDocument()
    expect(screen.getByLabelText('次の週')).toBeInTheDocument()
  })

  it('週の範囲が表示される', () => {
    render(
      <WeekNavigation
        onPreviousWeek={mockGoToPreviousWeek}
        onCurrentWeek={mockGoToCurrentWeek}
        onNextWeek={mockGoToNextWeek}
        getWeekRange={mockGetWeekRange}
      />
    )

    expect(screen.getByText('7月6日 - 7月12日')).toBeInTheDocument()
  })

  it('前週ボタンクリックで関数が呼ばれる', () => {
    render(
      <WeekNavigation
        onPreviousWeek={mockGoToPreviousWeek}
        onCurrentWeek={mockGoToCurrentWeek}
        onNextWeek={mockGoToNextWeek}
        getWeekRange={mockGetWeekRange}
      />
    )

    fireEvent.click(screen.getByLabelText('前の週'))
    expect(mockGoToPreviousWeek).toHaveBeenCalledTimes(1)
  })

  it('今週ボタンクリックで関数が呼ばれる', () => {
    render(
      <WeekNavigation
        onPreviousWeek={mockGoToPreviousWeek}
        onCurrentWeek={mockGoToCurrentWeek}
        onNextWeek={mockGoToNextWeek}
        getWeekRange={mockGetWeekRange}
      />
    )

    fireEvent.click(screen.getByText('今週'))
    expect(mockGoToCurrentWeek).toHaveBeenCalledTimes(1)
  })

  it('次週ボタンクリックで関数が呼ばれる', () => {
    render(
      <WeekNavigation
        onPreviousWeek={mockGoToPreviousWeek}
        onCurrentWeek={mockGoToCurrentWeek}
        onNextWeek={mockGoToNextWeek}
        getWeekRange={mockGetWeekRange}
      />
    )

    fireEvent.click(screen.getByLabelText('次の週'))
    expect(mockGoToNextWeek).toHaveBeenCalledTimes(1)
  })
})