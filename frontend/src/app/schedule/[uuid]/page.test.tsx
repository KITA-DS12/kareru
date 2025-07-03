import { render, screen } from '@testing-library/react'
import SchedulePage from './page'

// API関数をモック
jest.mock('../../../services/api', () => ({
  getSchedule: jest.fn(),
}))

describe('SchedulePage', () => {
  it('UUID付きURLでページがレンダリングされる', async () => {
    const mockParams = { uuid: 'test-uuid-123' }
    
    // ページコンポーネントをレンダリング
    render(<SchedulePage params={mockParams} />)
    
    // ページが表示されることを確認
    expect(screen.getByTestId('schedule-page')).toBeInTheDocument()
  })
})