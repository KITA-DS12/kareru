import { render, screen, waitFor } from '@testing-library/react'
import SchedulePage from './page'
import { getSchedule } from '../../../services/api'
import { validateScheduleURL } from '../../../utils/url-validation'
import { notFound } from 'next/navigation'

jest.mock('../../../services/api', () => ({
  getSchedule: jest.fn(),
}))

jest.mock('../../../utils/url-validation', () => ({
  validateScheduleURL: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

const mockGetSchedule = getSchedule as jest.MockedFunction<typeof getSchedule>
const mockValidateScheduleURL = validateScheduleURL as jest.MockedFunction<typeof validateScheduleURL>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>

describe('SchedulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // デフォルトで有効なUUIDとして扱う
    mockValidateScheduleURL.mockReturnValue({ isValid: true, error: null })
  })

  it('UUID付きURLでページがレンダリングされる', async () => {
    mockGetSchedule.mockReturnValue(new Promise(() => {}))
    
    const mockParams = { uuid: 'test-uuid-123' }
    render(<SchedulePage params={mockParams} />)
    expect(screen.getByTestId('schedule-page')).toBeInTheDocument()
  })

  it('should call notFound for invalid uuid', () => {
    mockValidateScheduleURL.mockReturnValue({ isValid: false, error: 'Invalid UUID format' })
    
    render(<SchedulePage params={{ uuid: 'invalid-uuid' }} />)
    
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('スケジュールデータを取得して表示する', async () => {
    const mockSchedule = {
      id: 'test-uuid-123',
      comment: 'テスト用スケジュール',
      timeSlots: [{
        startTime: new Date('2025-07-04T10:00:00Z'),
        endTime: new Date('2025-07-04T11:00:00Z'),
        available: true
      }],
      createdAt: new Date('2025-07-03T00:00:00Z'),
      expiresAt: new Date('2025-07-10T00:00:00Z')
    }

    mockGetSchedule.mockResolvedValue(mockSchedule)
    
    const mockParams = { uuid: 'test-uuid-123' }
    render(<SchedulePage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('テスト用スケジュール')).toBeInTheDocument()
    })
    
    expect(screen.getByTestId('time-grid-container')).toBeInTheDocument()
  })

  it('期限切れスケジュールに「期限切れ」ラベルを表示する', async () => {
    const expiredSchedule = {
      id: 'test-uuid-456',
      comment: '期限切れスケジュール',
      timeSlots: [{
        startTime: new Date('2025-07-04T10:00:00Z'),
        endTime: new Date('2025-07-04T11:00:00Z'),
        available: true
      }],
      createdAt: new Date('2025-07-01T00:00:00Z'),
      expiresAt: new Date('2025-07-02T00:00:00Z')
    }

    mockGetSchedule.mockResolvedValue(expiredSchedule)
    
    const mockParams = { uuid: 'test-uuid-456' }
    render(<SchedulePage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('期限切れスケジュール')).toBeInTheDocument()
    })
    
    expect(screen.getByTestId('expired-label')).toBeInTheDocument()
    expect(screen.getByText('期限切れ')).toBeInTheDocument()
  })

  it('正常なスケジュールには期限切れラベルを表示しない', async () => {
    const validSchedule = {
      id: 'test-uuid-789',
      comment: '正常なスケジュール',
      timeSlots: [{
        startTime: new Date('2025-07-04T10:00:00Z'),
        endTime: new Date('2025-07-04T11:00:00Z'),
        available: true
      }],
      createdAt: new Date('2025-07-03T00:00:00Z'),
      expiresAt: new Date('2025-07-10T00:00:00Z')
    }

    mockGetSchedule.mockResolvedValue(validSchedule)
    
    const mockParams = { uuid: 'test-uuid-789' }
    render(<SchedulePage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByText('正常なスケジュール')).toBeInTheDocument()
    })
    
    expect(screen.queryByTestId('expired-label')).not.toBeInTheDocument()
  })

  it('スケジュール未発見時にエラーメッセージを表示する', async () => {
    mockGetSchedule.mockRejectedValue(new Error('Schedule not found'))
    
    const mockParams = { uuid: 'invalid-uuid' }
    render(<SchedulePage params={mockParams} />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/スケジュールが見つかりませんでした/)).toBeInTheDocument()
  })
})