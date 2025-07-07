import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CalendarGrid from './CalendarGrid'
import { Schedule, TimeSlot } from '../../types/schedule'

describe('CalendarGrid Component', () => {
  const mockDate = new Date('2025-07-15T10:00:00') // 2025年7月15日10時
  
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Time Grid Foundation', () => {
    it('should render 24-hour time grid with 30-minute intervals', () => {
      render(<CalendarGrid />)
      
      // 24時間分のタイムスロット（48個の30分間隔）
      expect(screen.getByText('00:00 - 00:30')).toBeInTheDocument()
      expect(screen.getByText('00:30 - 01:00')).toBeInTheDocument()
      expect(screen.getByText('12:00 - 12:30')).toBeInTheDocument()
      expect(screen.getByText('23:30 - 24:00')).toBeInTheDocument()
    })

    it('should display current time indicator', () => {
      render(<CalendarGrid />)
      
      const currentTimeIndicator = screen.getByTestId('current-time-indicator')
      expect(currentTimeIndicator).toBeInTheDocument()
      expect(currentTimeIndicator).toHaveClass('bg-gradient-to-r')
    })

    it('should render 7-day week grid', () => {
      render(<CalendarGrid />)
      
      const weekDays = ['日', '月', '火', '水', '木', '金', '土']
      weekDays.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument()
      })
    })

    it('should be vertically scrollable', () => {
      render(<CalendarGrid />)
      
      const timeGrid = screen.getByTestId('time-grid-container')
      expect(timeGrid).toHaveClass('overflow-y-auto')
    })

    it('should highlight today column', () => {
      render(<CalendarGrid />)
      
      // 2025年7月15日は火曜日のヘッダー部分がハイライトされる
      const todayHeader = screen.getByText('15').parentElement
      expect(todayHeader).toHaveClass('bg-blue-600')
    })
  })

  describe('Event Bar Display', () => {
    const mockTimeSlots: TimeSlot[] = [
      {
        id: '1',
        StartTime: '2025-07-15T10:00:00',
        EndTime: '2025-07-15T11:30:00',
        Available: true
      },
      {
        id: '2',
        StartTime: '2025-07-15T14:00:00',
        EndTime: '2025-07-15T15:00:00',
        Available: false
      },
      {
        id: '3',
        StartTime: '2025-07-16T10:00:00',
        EndTime: '2025-07-16T10:30:00',
        Available: true
      }
    ]

    const mockSchedule: Schedule = {
      id: 'test-schedule',
      comment: 'テストスケジュール',
      timeSlots: mockTimeSlots
    }

    it('should display event bars with correct time positioning', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar1 = screen.getByTestId('event-bar-1')
      const eventBar2 = screen.getByTestId('event-bar-2')
      
      expect(eventBar1).toBeInTheDocument()
      expect(eventBar2).toBeInTheDocument()
    })

    it('should show different colors for available and unavailable slots', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const availableEvent = screen.getByTestId('event-bar-1')
      const unavailableEvent = screen.getByTestId('event-bar-2')
      
      expect(availableEvent).toHaveClass('from-emerald-500')
      expect(unavailableEvent).toHaveClass('from-red-500')
    })

    it('should display event time and duration', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar1 = screen.getByTestId('event-bar-1')
      expect(eventBar1).toHaveTextContent('10:00 - 11:30')
    })

    it('should handle overlapping events correctly', () => {
      const overlappingSlots: TimeSlot[] = [
        {
          id: '1',
          StartTime: '2025-07-15T10:00:00',
          EndTime: '2025-07-15T11:00:00',
          Available: true
        },
        {
          id: '2',
          StartTime: '2025-07-15T10:30:00',
          EndTime: '2025-07-15T11:30:00',
          Available: false
        }
      ]

      const overlappingSchedule: Schedule = {
        id: 'overlap-schedule',
        comment: 'オーバーラップテスト',
        timeSlots: overlappingSlots
      }

      render(<CalendarGrid schedule={overlappingSchedule} />)
      
      const event1 = screen.getByTestId('event-bar-1')
      const event2 = screen.getByTestId('event-bar-2')
      
      // 重複イベントは横に並んで表示される
      expect(event1).toHaveStyle('left: 0%')
      expect(event2).toHaveStyle('left: 50%')
    })

    it('should show tooltip on hover', async () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.mouseEnter(eventBar)
      
      await waitFor(() => {
        expect(screen.getByTestId('event-tooltip')).toBeInTheDocument()
        expect(screen.getByText('参加可能')).toBeInTheDocument()
      })
    })
  })

  describe('Drag and Drop Creation', () => {
    it('should allow dragging on empty time slots', () => {
      const mockOnCreateSlot = jest.fn()
      render(<CalendarGrid onCreateTimeSlot={mockOnCreateSlot} />)
      
      const emptySlot = screen.getByTestId('time-slot-15-20') // 7/15 10:00
      
      fireEvent.mouseDown(emptySlot)
      fireEvent.mouseMove(emptySlot, { clientY: 100 })
      fireEvent.mouseUp(emptySlot)
      
      expect(mockOnCreateSlot).toHaveBeenCalledWith(
        expect.objectContaining({
          StartTime: expect.stringContaining('2025-07-15T10:00'),
          EndTime: expect.stringContaining('2025-07-15T10:30')
        })
      )
    })

    it('should show visual feedback during drag', () => {
      render(<CalendarGrid />)
      
      const emptySlot = screen.getByTestId('time-slot-15-20')
      
      fireEvent.mouseDown(emptySlot)
      fireEvent.mouseMove(emptySlot, { clientY: 100 })
      
      const dragPreview = screen.getByTestId('drag-preview')
      expect(dragPreview).toBeInTheDocument()
      expect(dragPreview).toHaveClass('from-blue-200')
    })

    it('should enforce minimum 30-minute duration', () => {
      const mockOnCreateSlot = jest.fn()
      render(<CalendarGrid onCreateTimeSlot={mockOnCreateSlot} />)
      
      const emptySlot = screen.getByTestId('time-slot-15-20')
      
      // 15分だけドラッグ（最小30分に調整されるべき）
      fireEvent.mouseDown(emptySlot)
      fireEvent.mouseMove(emptySlot, { clientY: 25 }) // 15分相当
      fireEvent.mouseUp(emptySlot)
      
      expect(mockOnCreateSlot).toHaveBeenCalledWith(
        expect.objectContaining({
          EndTime: expect.stringContaining('10:30') // 30分に調整
        })
      )
    })

    it('should snap to grid during drag', () => {
      render(<CalendarGrid />)
      
      const emptySlot = screen.getByTestId('time-slot-15-20')
      
      fireEvent.mouseDown(emptySlot)
      fireEvent.mouseMove(emptySlot, { clientY: 75 }) // 22.5分位置
      
      const dragPreview = screen.getByTestId('drag-preview')
      // 30分位置にスナップされる
      expect(dragPreview).toHaveStyle('height: 60px') // 30分 = 60px
    })
  })

  describe('Inline Editing', () => {
    const mockSchedule: Schedule = {
      id: 'edit-schedule',
      comment: 'テスト',
      timeSlots: [{
        id: '1',
        StartTime: '2025-07-15T10:00:00',
        EndTime: '2025-07-15T11:00:00',
        Available: true
      }]
    }

    it('should open edit modal on event click', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.click(eventBar)
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10:00')).toBeInTheDocument()
      expect(screen.getByDisplayValue('11:00')).toBeInTheDocument()
    })

    it('should toggle availability status', () => {
      const mockOnUpdateSlot = jest.fn()
      render(<CalendarGrid schedule={mockSchedule} onUpdateTimeSlot={mockOnUpdateSlot} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.click(eventBar)
      
      const availableToggle = screen.getByTestId('available-toggle')
      fireEvent.click(availableToggle)
      
      expect(mockOnUpdateSlot).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ Available: false })
      )
    })

    it('should validate time inputs', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.click(eventBar)
      
      const startTimeInput = screen.getByDisplayValue('10:00')
      fireEvent.change(startTimeInput, { target: { value: '12:00' } })
      
      const endTimeInput = screen.getByDisplayValue('11:00')
      fireEvent.change(endTimeInput, { target: { value: '11:30' } })
      
      // 開始時刻が終了時刻より後になる場合のエラー
      expect(screen.getByText('終了時刻は開始時刻より後である必要があります')).toBeInTheDocument()
    })

    it('should close modal on ESC key', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.click(eventBar)
      
      expect(screen.getByTestId('edit-modal')).toBeInTheDocument()
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(screen.queryByTestId('edit-modal')).not.toBeInTheDocument()
    })
  })

  describe('Resize Functionality', () => {
    const mockSchedule: Schedule = {
      id: 'resize-schedule',
      comment: 'リサイズテスト',
      timeSlots: [{
        id: '1',
        StartTime: '2025-07-15T10:00:00',
        EndTime: '2025-07-15T11:00:00',
        Available: true
      }]
    }

    it('should show resize handles on hover', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.mouseEnter(eventBar)
      
      expect(screen.getByTestId('resize-handle-top')).toBeInTheDocument()
      expect(screen.getByTestId('resize-handle-bottom')).toBeInTheDocument()
    })

    it('should resize event by dragging handles', () => {
      const mockOnUpdateSlot = jest.fn()
      render(<CalendarGrid schedule={mockSchedule} onUpdateTimeSlot={mockOnUpdateSlot} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.mouseEnter(eventBar)
      
      const bottomHandle = screen.getByTestId('resize-handle-bottom')
      fireEvent.mouseDown(bottomHandle)
      fireEvent.mouseMove(bottomHandle, { clientY: 60 }) // 30分延長
      fireEvent.mouseUp(bottomHandle)
      
      expect(mockOnUpdateSlot).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          EndTime: expect.stringContaining('11:30')
        })
      )
    })

    it('should snap resize to 30-minute intervals', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.mouseEnter(eventBar)
      
      const bottomHandle = screen.getByTestId('resize-handle-bottom')
      fireEvent.mouseDown(bottomHandle)
      fireEvent.mouseMove(bottomHandle, { clientY: 45 }) // 22.5分位置
      
      // 30分位置にスナップされる
      const resizePreview = screen.getByTestId('resize-preview')
      expect(resizePreview).toHaveStyle('height: 120px') // 1時間 = 120px
    })

    it('should prevent invalid resize operations', () => {
      render(<CalendarGrid schedule={mockSchedule} />)
      
      const eventBar = screen.getByTestId('event-bar-1')
      fireEvent.mouseEnter(eventBar)
      
      const topHandle = screen.getByTestId('resize-handle-top')
      fireEvent.mouseDown(topHandle)
      fireEvent.mouseMove(topHandle, { clientY: 100 }) // 開始時刻を終了時刻より後に
      
      // 無効なリサイズは実行されない
      expect(screen.getByTestId('resize-error')).toHaveTextContent(
        '最小30分の期間が必要です'
      )
    })
  })
})