import { render, screen, fireEvent } from '@testing-library/react'
import DeleteTimeSlotModal from './DeleteTimeSlotModal'
import { TimeSlot } from '@/types/schedule'

describe('DeleteTimeSlotModal', () => {
  const mockTimeSlot: TimeSlot = {
    id: 'test-id',
    startTime: '10:00',
    endTime: '11:30',
    available: true
  }

  const mockOnDelete = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnDelete.mockClear()
    mockOnClose.mockClear()
  })

  describe('モーダル表示', () => {
    it('モーダルが正しく表示される', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument()
    })

    it('時間帯情報が正しく表示される', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('10:00-11:30のタイムスロットを削除しますか？')).toBeInTheDocument()
    })

    it('削除ボタンとキャンセルボタンが表示される', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.getByText('削除')).toBeInTheDocument()
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })

    it('モーダルが閉じている時は表示されない', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={false}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument()
    })
  })

  describe('削除処理', () => {
    it('削除ボタンクリック時に削除処理が実行される', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      fireEvent.click(screen.getByText('削除'))
      expect(mockOnDelete).toHaveBeenCalledWith(mockTimeSlot.id)
    })

    it('キャンセルボタンクリック時にモーダルが閉じる', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      fireEvent.click(screen.getByText('キャンセル'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('モーダル外クリックでモーダルが閉じる', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      fireEvent.click(screen.getByTestId('modal-overlay'))
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('ESCキーでモーダルが閉じる', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('ボタンのtype属性', () => {
    it('全ボタンにtype="button"が設定されている', () => {
      render(
        <DeleteTimeSlotModal
          isOpen={true}
          timeSlot={mockTimeSlot}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      )

      const deleteButton = screen.getByText('削除')
      const cancelButton = screen.getByText('キャンセル')
      
      expect(deleteButton).toHaveAttribute('type', 'button')
      expect(cancelButton).toHaveAttribute('type', 'button')
    })
  })
})