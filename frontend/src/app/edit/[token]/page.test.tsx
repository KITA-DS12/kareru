import { render, screen, waitFor } from '@testing-library/react'
import EditPage from './page'
import { getScheduleByToken } from '../../../services/api'

// API関数をモック
jest.mock('../../../services/api', () => ({
  getScheduleByToken: jest.fn(),
}))

const mockGetScheduleByToken = getScheduleByToken as jest.MockedFunction<typeof getScheduleByToken>

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
})