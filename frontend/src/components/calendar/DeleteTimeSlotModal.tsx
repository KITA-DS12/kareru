import { useEffect } from 'react'
import { TimeSlot } from '@/types/schedule'

interface DeleteTimeSlotModalProps {
  isOpen: boolean
  timeSlot: TimeSlot
  onDelete: (id: string) => void
  onClose: () => void
}

export default function DeleteTimeSlotModal({
  isOpen,
  timeSlot,
  onDelete,
  onClose
}: DeleteTimeSlotModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleDelete = () => {
    onDelete(timeSlot.id)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        data-testid="delete-modal"
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <h2 className="text-lg font-semibold mb-4">
          {timeSlot.startTime}-{timeSlot.endTime}のタイムスロットを削除しますか？
        </h2>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}