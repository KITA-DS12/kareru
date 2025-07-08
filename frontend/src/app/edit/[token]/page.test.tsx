import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import EditPage from './page'
import { getScheduleByToken } from '../../../services/api'
import { validateEditURL } from '../../../utils/url-validation'
import { notFound } from 'next/navigation'

// API関数とユーティリティをモック
jest.mock('../../../services/api', () => ({
  getScheduleByToken: jest.fn(),
}))

jest.mock('../../../utils/url-validation', () => ({
  validateEditURL: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

const mockGetScheduleByToken = getScheduleByToken as jest.MockedFunction<typeof getScheduleByToken>
const mockValidateEditURL = validateEditURL as jest.MockedFunction<typeof validateEditURL>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>

// 有効な64文字の16進数トークン
const validToken = 'a'.repeat(64)

describe('EditPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトで有効なトークンとして扱う
    mockValidateEditURL.mockReturnValue({ isValid: true, error: null })
  })

  it('should call notFound for invalid token', () => {
    mockValidateEditURL.mockReturnValue({ isValid: false, error: 'Invalid token format' })
    
    render(<EditPage params={{ token: 'invalid-token' }} />)
    
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should render loading state initially for valid token', () => {
    mockGetScheduleByToken.mockReturnValue(new Promise(() => {}))
    
    render(<EditPage params={{ token: validToken }} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render error state when API fails', async () => {
    mockGetScheduleByToken.mockRejectedValue(new Error('API Error'))
    
    render(<EditPage params={{ token: validToken }} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    expect(screen.getByText('編集権限がありません')).toBeInTheDocument()
  })

  it('should render edit form when schedule is loaded', async () => {
    const mockSchedule = {
      id: 'test-schedule',
      comment: 'Test schedule',
      timeSlots: [],
      editToken: validToken,
      createdAt: '2024-01-01T08:00:00Z',
      expiresAt: '2024-01-08T08:00:00Z'
    }
    
    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    render(<EditPage params={{ token: validToken }} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test schedule')).toBeInTheDocument()
    })
    
    expect(screen.getByTestId('edit-form')).toBeInTheDocument()
  })

  it('should show edit functionality disabled message', async () => {
    const mockSchedule = {
      id: 'test-schedule',
      comment: 'Test schedule',
      timeSlots: [
        { 
          id: '1', 
          StartTime: '2024-01-01T09:00:00Z', 
          EndTime: '2024-01-01T10:00:00Z', 
          Available: true 
        }
      ],
      editToken: validToken,
      createdAt: '2024-01-01T08:00:00Z',
      expiresAt: '2024-01-08T08:00:00Z'
    }
    
    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    render(<EditPage params={{ token: validToken }} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test schedule')).toBeInTheDocument()
    })
    
    const saveButton = screen.getByRole('button', { name: /保存/ })
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('編集機能は現在利用できません')).toBeInTheDocument()
    })
  })
})