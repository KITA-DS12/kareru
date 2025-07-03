import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import EditPage from './page'
import { getScheduleByToken, updateSchedule } from '../../../services/api'

// API関数をモック
jest.mock('../../../services/api', () => ({
  getScheduleByToken: jest.fn(),
  updateSchedule: jest.fn(),
}))

const mockGetScheduleByToken = getScheduleByToken as jest.MockedFunction<typeof getScheduleByToken>
const mockUpdateSchedule = updateSchedule as jest.MockedFunction<typeof updateSchedule>

describe('EditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('編集トークン付きURLでページがレンダリングされる', async () => {
    const mockParams = { token: 'test-edit-token-123' }
    
    // ページコンポーネントをレンダリング
    render(<EditPage params={mockParams} />)
    
    // ページが表示されることを確認
    expect(screen.getByTestId('edit-page')).toBeInTheDocument()
  })

  it('有効な編集トークンでスケジュール編集フォームを表示する', async () => {
    const mockSchedule = {
      id: 'test-uuid-123',
      comment: 'テスト用スケジュール',
      timeSlots: [{
        StartTime: '2025-07-04T10:00:00Z',
        EndTime: '2025-07-04T11:00:00Z',
        Available: true
      }],
      createdAt: '2025-07-03T00:00:00Z',
      expiresAt: '2025-07-10T00:00:00Z'
    }

    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    const mockParams = { token: 'valid-edit-token' }
    render(<EditPage params={mockParams} />)
    
    // スケジュール編集フォームが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
    })
    
    expect(screen.getByDisplayValue('テスト用スケジュール')).toBeInTheDocument()
  })

  it('無効な編集トークンでエラーメッセージを表示する', async () => {
    mockGetScheduleByToken.mockRejectedValue(new Error('Invalid token'))
    
    const mockParams = { token: 'invalid-token' }
    render(<EditPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/編集権限がありません/)).toBeInTheDocument()
  })

  it('スケジュールコメントを編集できる', async () => {
    const mockSchedule = {
      id: 'test-uuid-123',
      comment: 'テスト用スケジュール',
      timeSlots: [{
        StartTime: '2025-07-04T10:00:00Z',
        EndTime: '2025-07-04T11:00:00Z',
        Available: true
      }],
      createdAt: '2025-07-03T00:00:00Z',
      expiresAt: '2025-07-10T00:00:00Z'
    }

    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    const mockParams = { token: 'valid-edit-token' }
    render(<EditPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
    })

    const commentInput = screen.getByDisplayValue('テスト用スケジュール')
    fireEvent.change(commentInput, { target: { value: '編集されたコメント' } })
    
    expect(commentInput).toHaveValue('編集されたコメント')
  })

  it('編集内容を保存できる', async () => {
    const mockSchedule = {
      id: 'test-uuid-123',
      comment: 'テスト用スケジュール',
      timeSlots: [{
        StartTime: '2025-07-04T10:00:00Z',
        EndTime: '2025-07-04T11:00:00Z',
        Available: true
      }],
      createdAt: '2025-07-03T00:00:00Z',
      expiresAt: '2025-07-10T00:00:00Z'
    }

    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    mockUpdateSchedule.mockResolvedValue(mockSchedule)
    
    const mockParams = { token: 'valid-edit-token' }
    render(<EditPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-form')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockUpdateSchedule).toHaveBeenCalledWith('valid-edit-token', expect.objectContaining({
        comment: 'テスト用スケジュール'
      }))
    })
  })

  it('タイムスロットの選択状態を変更できる', async () => {
    const mockSchedule = {
      id: 'test-uuid-123',
      comment: 'テスト用スケジュール',
      timeSlots: [{
        StartTime: '2025-07-04T10:00:00Z',
        EndTime: '2025-07-04T11:00:00Z',
        Available: false
      }],
      createdAt: '2025-07-03T00:00:00Z',
      expiresAt: '2025-07-10T00:00:00Z'
    }

    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    const mockParams = { token: 'valid-edit-token' }
    render(<EditPage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('timeslot-list')).toBeInTheDocument()
    })

    const timeSlotCheckbox = screen.getByRole('checkbox')
    expect(timeSlotCheckbox).not.toBeChecked()
    
    fireEvent.click(timeSlotCheckbox)
    expect(timeSlotCheckbox).toBeChecked()
  })
})