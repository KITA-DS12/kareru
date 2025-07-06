import { render, screen, fireEvent } from '@testing-library/react'
import EventEditor from './EventEditor'

interface EditingEvent {
  id: string
  startTime: string
  endTime: string
}

describe('EventEditor', () => {
  const mockEditingEvent: EditingEvent = {
    id: '1',
    startTime: '2024-07-16T10:00',
    endTime: '2024-07-16T11:00'
  }

  const mockOnSave = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnClose = jest.fn()
  const mockOnUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('編集モーダルが正しく表示される', () => {
    render(
      <EventEditor
        editingEvent={mockEditingEvent}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    )

    const modal = screen.getByTestId('edit-modal')
    expect(modal).toBeInTheDocument()
    expect(screen.getByText('タイムスロット編集')).toBeInTheDocument()
  })

  it('開始時刻と終了時刻のフィールドが表示される', () => {
    render(
      <EventEditor
        editingEvent={mockEditingEvent}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByLabelText('開始時刻')).toBeInTheDocument()
    expect(screen.getByLabelText('終了時刻')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-07-16T10:00')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-07-16T11:00')).toBeInTheDocument()
  })

  it('保存ボタンと削除ボタンが表示される', () => {
    render(
      <EventEditor
        editingEvent={mockEditingEvent}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    )

    expect(screen.getByText('保存')).toBeInTheDocument()
    expect(screen.getByText('削除')).toBeInTheDocument()
  })

  it('時刻変更でonUpdateが呼ばれる', () => {
    render(
      <EventEditor
        editingEvent={mockEditingEvent}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    )

    const startTimeInput = screen.getByLabelText('開始時刻')
    fireEvent.change(startTimeInput, { target: { value: '2024-07-16T09:00' } })
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ startTime: '2024-07-16T09:00' })
  })

  it('保存・削除・閉じるボタンで適切なハンドラーが呼ばれる', () => {
    render(
      <EventEditor
        editingEvent={mockEditingEvent}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onClose={mockOnClose}
        onUpdate={mockOnUpdate}
      />
    )

    fireEvent.click(screen.getByText('保存'))
    expect(mockOnSave).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('削除'))
    expect(mockOnDelete).toHaveBeenCalledTimes(1)

    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})