import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CalendarGrid from './CalendarGrid'

// モック化されたタイムゾーン関数
jest.mock('../../utils/timezone', () => ({
  getJSTNow: () => new Date('2025-07-09T10:00:00Z'), // 水曜日
  getJSTWeekDates: (date: Date) => {
    // 2025-07-06 (日) から 2025-07-12 (土) の週を返す
    const sunday = new Date('2025-07-06T00:00:00Z')
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      dates.push(date)
    }
    return dates
  },
  getCurrentJSTMinutes: () => 600, // 10:00
  isJSTToday: (date: Date) => {
    const today = new Date('2025-07-09T00:00:00Z')
    return date.toDateString() === today.toDateString()
  },
  utcToJST: (date: Date) => date,
  formatJSTTime: (date: Date) => date.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}))

describe('週ナビゲーション機能', () => {
  it('週ナビゲーションバーが表示される', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    expect(screen.getByText('前週')).toBeInTheDocument()
    expect(screen.getByText('今週')).toBeInTheDocument()
    expect(screen.getByText('翌週')).toBeInTheDocument()
  })

  it('週の範囲が正しく表示される', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    // 7月6日-7月12日の週が表示されることを確認
    expect(screen.getByText('7月6日 - 7月12日')).toBeInTheDocument()
  })

  it('前週ボタンをクリックできる', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    const prevButton = screen.getByText('前週')
    fireEvent.click(prevButton)
    
    // ボタンがクリックできることを確認（エラーが発生しない）
    expect(prevButton).toBeInTheDocument()
  })

  it('翌週ボタンをクリックできる', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    const nextButton = screen.getByText('翌週')
    fireEvent.click(nextButton)
    
    // ボタンがクリックできることを確認（エラーが発生しない）
    expect(nextButton).toBeInTheDocument()
  })

  it('今週ボタンをクリックできる', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    const currentButton = screen.getByText('今週')
    fireEvent.click(currentButton)
    
    // ボタンがクリックできることを確認（エラーが発生しない）
    expect(currentButton).toBeInTheDocument()
  })

  it('showWeekNavigationがfalseの場合、ナビゲーションが表示されない', () => {
    render(<CalendarGrid showWeekNavigation={false} />)
    
    expect(screen.queryByText('前週')).not.toBeInTheDocument()
    expect(screen.queryByText('今週')).not.toBeInTheDocument()
    expect(screen.queryByText('翌週')).not.toBeInTheDocument()
  })

  it('アクセシビリティのためのaria-labelが設定されている', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    expect(screen.getByLabelText('前の週')).toBeInTheDocument()
    expect(screen.getByLabelText('次の週')).toBeInTheDocument()
  })

  it('週ヘッダーに日付が表示される', () => {
    render(<CalendarGrid showWeekNavigation={true} />)
    
    // 初期状態で7月6日(日)から7月12日(土)のヘッダーが表示される
    expect(screen.getByText('6')).toBeInTheDocument() // 日曜日
    expect(screen.getByText('7')).toBeInTheDocument() // 月曜日
    expect(screen.getByText('8')).toBeInTheDocument() // 火曜日
    expect(screen.getByText('9')).toBeInTheDocument() // 水曜日
    expect(screen.getByText('10')).toBeInTheDocument() // 木曜日
    expect(screen.getByText('11')).toBeInTheDocument() // 金曜日
    expect(screen.getByText('12')).toBeInTheDocument() // 土曜日
  })
})