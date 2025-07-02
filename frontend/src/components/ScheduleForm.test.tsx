import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScheduleForm from './ScheduleForm'

describe('ScheduleForm', () => {
  it('フォームコンポーネントが正しくレンダリングされる', () => {
    render(<ScheduleForm />)
    
    expect(screen.getByText('スケジュール作成')).toBeInTheDocument()
    expect(screen.getByLabelText('コメント')).toBeInTheDocument()
    expect(screen.getByText('時間スロットを追加')).toBeInTheDocument()
    expect(screen.getByText('作成')).toBeInTheDocument()
  })

  it('コメント入力フィールドが正しく動作する', () => {
    render(<ScheduleForm />)
    
    const commentInput = screen.getByLabelText('コメント')
    fireEvent.change(commentInput, { target: { value: 'テストコメント' } })
    
    expect(commentInput).toHaveValue('テストコメント')
  })

  it('時間スロット追加ボタンが機能する', () => {
    render(<ScheduleForm />)
    
    const addButton = screen.getByText('時間スロットを追加')
    fireEvent.click(addButton)
    
    expect(screen.getByText('開始時刻')).toBeInTheDocument()
    expect(screen.getByText('終了時刻')).toBeInTheDocument()
  })

  it('フォーム送信時のバリデーション', async () => {
    render(<ScheduleForm />)
    
    const submitButton = screen.getByText('作成')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('時間スロットを追加してください')).toBeInTheDocument()
    })
  })
})