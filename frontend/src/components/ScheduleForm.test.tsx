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

  it('フォーム送信成功時のURL表示', async () => {
    // APIモック
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'test-id-123',
        editToken: 'test-token-456',
        comment: 'テストスケジュール',
        timeSlots: [],
        createdAt: '2024-01-01T00:00:00Z',
        expiresAt: '2024-01-08T00:00:00Z'
      })
    })

    render(<ScheduleForm />)
    
    // コメント入力
    const commentInput = screen.getByLabelText('コメント')
    fireEvent.change(commentInput, { target: { value: 'テストスケジュール' } })
    
    // 時間スロット追加
    const addButton = screen.getByText('時間スロットを追加')
    fireEvent.click(addButton)
    
    // 時間スロット入力
    const startInputs = screen.getAllByDisplayValue('')
    fireEvent.change(startInputs[0], { target: { value: '2024-01-01T10:00' } })
    fireEvent.change(startInputs[1], { target: { value: '2024-01-01T11:00' } })
    
    // フォーム送信
    const submitButton = screen.getByText('作成')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('スケジュールが作成されました')).toBeInTheDocument()
      expect(screen.getByText('URL:')).toBeInTheDocument()
    })
  })

  it('API連携エラー時のエラー表示', async () => {
    // APIエラーモック
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    render(<ScheduleForm />)
    
    // コメント入力
    const commentInput = screen.getByLabelText('コメント')
    fireEvent.change(commentInput, { target: { value: 'テストスケジュール' } })
    
    // 時間スロット追加
    const addButton = screen.getByText('時間スロットを追加')
    fireEvent.click(addButton)
    
    // 時間スロット入力
    const startInputs = screen.getAllByDisplayValue('')
    fireEvent.change(startInputs[0], { target: { value: '2024-01-01T10:00' } })
    fireEvent.change(startInputs[1], { target: { value: '2024-01-01T11:00' } })
    
    // フォーム送信
    const submitButton = screen.getByText('作成')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('スケジュールの作成に失敗しました')).toBeInTheDocument()
    })
  })
})