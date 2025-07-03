import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

describe('NotFound Page', () => {
  it('should render 404 error message', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument()
  })

  it('should render home link', () => {
    render(<NotFound />)
    const homeLink = screen.getByRole('link', { name: /ホームに戻る/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should render create schedule link', () => {
    render(<NotFound />)
    const createLink = screen.getByRole('link', { name: /新しいスケジュールを作成/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute('href', '/create')
  })

  it('should have proper styling', () => {
    render(<NotFound />)
    const container = screen.getByTestId('not-found-page')
    expect(container).toBeInTheDocument()
  })
})