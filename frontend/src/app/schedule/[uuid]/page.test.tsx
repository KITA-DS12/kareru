import { render, screen, waitFor } from '@testing-library/react'
import SchedulePage from './page'
import { getSchedule } from '../../../services/api'

jest.mock('../../../services/api', () => ({
  getSchedule: jest.fn(),
}))

const mockGetSchedule = getSchedule as jest.MockedFunction<typeof getSchedule>

describe('SchedulePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('UUID付きURLでページがレンダリングされる', async () => {
    const mockParams = { uuid: 'test-uuid-123' }
    render(<SchedulePage params={mockParams} />)
    expect(screen.getByTestId('schedule-page')).toBeInTheDocument()
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
    
    expect(screen.getByTestId('time-slot-list')).toBeInTheDocument()
  })
})