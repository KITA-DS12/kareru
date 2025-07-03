import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Home from './page'

// Next.js routerをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Home Page', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    jest.clearAllMocks()
  })

  it('should redirect to create page after 2 seconds', async () => {
    jest.useFakeTimers()
    render(<Home />)
    
    expect(screen.getByText('リダイレクト中...')).toBeInTheDocument()
    
    jest.advanceTimersByTime(2000)
    
    expect(mockPush).toHaveBeenCalledWith('/create')
    jest.useRealTimers()
  })

  it('should show redirect message', () => {
    render(<Home />)
    expect(screen.getByText('スケジュール作成ページに移動します')).toBeInTheDocument()
  })

  it('should have manual link to create page', () => {
    render(<Home />)
    const createLink = screen.getByRole('link', { name: /今すぐ作成/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute('href', '/create')
  })

  it('should display loading spinner', () => {
    render(<Home />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
  })
})