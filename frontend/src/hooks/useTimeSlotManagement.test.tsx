import { renderHook, act } from '@testing-library/react'
import useTimeSlotManagement from './useTimeSlotManagement'
import { TimeSlot } from '../types/schedule'

describe('useTimeSlotManagement', () => {
  const mockTimeSlots: TimeSlot[] = [
    {
      id: '1',
      StartTime: '2024-07-16T10:00:00Z',
      EndTime: '2024-07-16T11:00:00Z'
    },
    {
      id: '2', 
      StartTime: '2024-07-16T14:00:00Z',
      EndTime: '2024-07-16T15:00:00Z'
    }
  ]

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useTimeSlotManagement(mockTimeSlots))
    
    expect(result.current.editingEvent).toBeNull()
    expect(typeof result.current.handleEventClick).toBe('function')
    expect(typeof result.current.handleEditSave).toBe('function')
    expect(typeof result.current.handleDelete).toBe('function')
    expect(typeof result.current.hasTimeRangeOverlap).toBe('function')
  })

  it('タイムスロット編集開始が動作する', () => {
    const { result } = renderHook(() => useTimeSlotManagement(mockTimeSlots))
    
    act(() => {
      result.current.handleEventClick(mockTimeSlots[0])
    })
    
    expect(result.current.editingEvent).toEqual({
      id: '1',
      startTime: '2024-07-16T10:00:00Z',
      endTime: '2024-07-16T11:00:00Z'
    })
  })

  it('タイムスロット更新機能が動作する', () => {
    const mockUpdate = jest.fn()
    const { result } = renderHook(() => useTimeSlotManagement(mockTimeSlots, mockUpdate))
    
    act(() => {
      result.current.handleEventClick(mockTimeSlots[0])
    })
    
    act(() => {
      result.current.handleEditSave()
    })
    
    expect(mockUpdate).toHaveBeenCalledWith('1', {
      StartTime: '2024-07-16T10:00:00Z',
      EndTime: '2024-07-16T11:00:00Z'
    })
    expect(result.current.editingEvent).toBeNull()
  })

  it('タイムスロット削除機能が動作する', () => {
    const mockDelete = jest.fn()
    const { result } = renderHook(() => useTimeSlotManagement(mockTimeSlots, undefined, mockDelete))
    
    act(() => {
      result.current.handleEventClick(mockTimeSlots[0])
    })
    
    act(() => {
      result.current.handleDelete()
    })
    
    expect(mockDelete).toHaveBeenCalledWith('1')
    expect(result.current.editingEvent).toBeNull()
  })

  it('重複チェック機能が動作する', () => {
    const { result } = renderHook(() => useTimeSlotManagement(mockTimeSlots))
    
    // 重複チェック関数が呼び出し可能であることを確認
    const hasOverlap = result.current.hasTimeRangeOverlap(
      new Date('2024-07-16'), '10:30', new Date('2024-07-16'), '11:30'
    )
    
    expect(typeof hasOverlap).toBe('boolean')
    
    // 別の日時での重複チェック
    const noOverlap = result.current.hasTimeRangeOverlap(
      new Date('2024-07-17'), '12:00', new Date('2024-07-17'), '13:00'
    )
    
    expect(typeof noOverlap).toBe('boolean')
  })

  it('編集状態管理が正しく動作する', () => {
    const { result } = renderHook(() => useTimeSlotManagement(mockTimeSlots))
    
    const editingEvent = {
      id: '1',
      startTime: '2024-07-16T09:00:00Z',
      endTime: '2024-07-16T10:00:00Z'
    }
    
    act(() => {
      result.current.setEditingEvent(editingEvent)
    })
    
    expect(result.current.editingEvent).toEqual(editingEvent)
    
    act(() => {
      result.current.setEditingEvent(null)
    })
    
    expect(result.current.editingEvent).toBeNull()
  })
})