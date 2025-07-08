import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

  it('should render loading state initially', () => {
    mockGetScheduleByToken.mockReturnValue(new Promise(() => {}))
    
    render(<EditPage params={{ token: 'test-token' }} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render error state when API fails', async () => {
    mockGetScheduleByToken.mockRejectedValue(new Error('API Error'))
    
    render(<EditPage params={{ token: 'test-token' }} />)
    
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
      editToken: 'test-token',
      createdAt: '2024-01-01T08:00:00Z',
      expiresAt: '2024-01-08T08:00:00Z'
    }
    
    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    render(<EditPage params={{ token: 'test-token' }} />)
    
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
      editToken: 'test-token',
      createdAt: '2024-01-01T08:00:00Z',
      expiresAt: '2024-01-08T08:00:00Z'
    }
    
    mockGetScheduleByToken.mockResolvedValue(mockSchedule)
    
    render(<EditPage params={{ token: 'test-token' }} />)
    
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