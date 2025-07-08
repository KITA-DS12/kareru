import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScheduleForm from './ScheduleForm'
import { useScheduleForm } from '../hooks/useScheduleForm'

jest.mock('../hooks/useScheduleForm')

const mockUseScheduleForm = useScheduleForm as jest.MockedFunction<typeof useScheduleForm>

describe('ScheduleForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトモック
    mockUseScheduleForm.mockReturnValue({
      comment: '',
      setComment: jest.fn(),
      timeSlots: [],
      error: '',
      isLoading: false,
      successData: null,
      addTimeSlot: jest.fn(),
      addTimeSlots: jest.fn(),
      addTimeSlotsWithMerge: jest.fn(),
      removeTimeSlot: jest.fn(),
      submitForm: jest.fn().mockResolvedValue(false),
    })
  })
  it('フォームコンポーネントが正しくレンダリングされる', () => {
    render(<ScheduleForm />)
    
    expect(screen.getByText('スケジュール作成')).toBeInTheDocument()
    expect(screen.getByLabelText('コメント')).toBeInTheDocument()
    expect(screen.getByText('作成')).toBeInTheDocument()
    // CalendarGridが表示される
    expect(screen.getByTestId('time-grid-container')).toBeInTheDocument()
  })

  it('コメント入力フィールドが正しく動作する', () => {
    const mockSetComment = jest.fn()
    mockUseScheduleForm.mockReturnValue({
      comment: '',
      setComment: mockSetComment,
      timeSlots: [],
      error: '',
      isLoading: false,
      successData: null,
      addTimeSlot: jest.fn(),
      addTimeSlots: jest.fn(),
      addTimeSlotsWithMerge: jest.fn(),
      removeTimeSlot: jest.fn(),
      submitForm: jest.fn().mockResolvedValue(false),
    })
    
    render(<ScheduleForm />)
    
    const commentInput = screen.getByLabelText('コメント')
    fireEvent.change(commentInput, { target: { value: 'テストコメント' } })
    
    expect(mockSetComment).toHaveBeenCalledWith('テストコメント')
  })

  it('カレンダーグリッドが正しく表示される', () => {
    render(<ScheduleForm />)
    
    // カレンダーグリッドの基本要素が表示される
    expect(screen.getByTestId('time-grid-container')).toBeInTheDocument()
    expect(screen.getByText('時刻')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
  })

  it('フォーム送信時のバリデーション', async () => {
    const mockSubmitForm = jest.fn().mockResolvedValue(false)
    mockUseScheduleForm.mockReturnValue({
      comment: '',
      setComment: jest.fn(),
      timeSlots: [],
      error: 'カレンダーから利用可能な時間を選択してください',
      isLoading: false,
      successData: null,
      addTimeSlot: jest.fn(),
      addTimeSlots: jest.fn(),
      addTimeSlotsWithMerge: jest.fn(),
      removeTimeSlot: jest.fn(),
      submitForm: mockSubmitForm,
    })
    
    render(<ScheduleForm />)
    
    const submitButton = screen.getByText('作成')
    fireEvent.click(submitButton)
    
    expect(mockSubmitForm).toHaveBeenCalled()
    expect(screen.getByText('カレンダーから利用可能な時間を選択してください')).toBeInTheDocument()
  })

  it('フォーム送信成功時のURL表示', async () => {
    // 成功状態のモック
    mockUseScheduleForm.mockReturnValue({
      comment: 'テストスケジュール',
      setComment: jest.fn(),
      timeSlots: [{ id: '1', startTime: '2024-01-01T09:00:00Z', endTime: '2024-01-01T10:00:00Z' }],
      error: '',
      isLoading: false,
      successData: {
        id: 'test-id-123',
        editToken: 'test-token-456',
        comment: 'テストスケジュール',
        timeSlots: [],
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-08T00:00:00Z'
      },
      addTimeSlot: jest.fn(),
      addTimeSlots: jest.fn(),
      addTimeSlotsWithMerge: jest.fn(),
      removeTimeSlot: jest.fn(),
      submitForm: jest.fn().mockResolvedValue(true),
    })
    
    render(<ScheduleForm />)
    
    expect(screen.getByText('スケジュールが作成されました')).toBeInTheDocument()
    expect(screen.getByText(/公開URL/)).toBeInTheDocument()
  })

  it('API連携エラー時のエラー表示', async () => {
    // エラー状態のモック
    mockUseScheduleForm.mockReturnValue({
      comment: 'テストスケジュール',
      setComment: jest.fn(),
      timeSlots: [{ id: '1', startTime: '2024-01-01T09:00:00Z', endTime: '2024-01-01T10:00:00Z' }],
      error: 'スケジュールの作成に失敗しました',
      isLoading: false,
      successData: null,
      addTimeSlot: jest.fn(),
      addTimeSlots: jest.fn(),
      addTimeSlotsWithMerge: jest.fn(),
      removeTimeSlot: jest.fn(),
      submitForm: jest.fn().mockResolvedValue(false),
    })
    
    render(<ScheduleForm />)
    
    expect(screen.getByText('スケジュールの作成に失敗しました')).toBeInTheDocument()
  })
})