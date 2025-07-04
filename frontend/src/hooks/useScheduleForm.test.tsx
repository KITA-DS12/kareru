import { renderHook, act } from '@testing-library/react'
import { useScheduleForm } from './useScheduleForm'

// モック化されたAPI関数
jest.mock('../services/api', () => ({
  createSchedule: jest.fn()
}))

describe('useScheduleForm', () => {
  describe('mergeConsecutiveSlots', () => {
    it('同じ日付内の連続する時間スロットを結合する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 同じ日付内の連続する時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T10:30:00')
      })
      
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:30:00', '2025-07-04T11:00:00')
      })

      // 結合されて1つのスロットになることを確認
      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T11:00:00'
      })
    })

    it('日付を跨ぐ時間スロットは結合しない', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 日付を跨ぐ時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T23:00:00', '2025-07-04T23:59:00')
      })
      
      act(() => {
        result.current.addTimeSlot('2025-07-05T00:00:00', '2025-07-05T01:00:00')
      })

      // 結合されず2つのスロットが残ることを確認
      expect(result.current.timeSlots).toHaveLength(2)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T23:00:00',
        endTime: '2025-07-04T23:59:00'
      })
      expect(result.current.timeSlots[1]).toMatchObject({
        startTime: '2025-07-05T00:00:00',
        endTime: '2025-07-05T01:00:00'
      })
    })

    it('日付跨ぎの連続する時間（23:59→00:00）でも結合しない', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 23:59で終わる時間スロットと00:00で始まる時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T23:30:00', '2025-07-04T23:59:00')
      })
      
      act(() => {
        result.current.addTimeSlot('2025-07-05T00:00:00', '2025-07-05T00:30:00')
      })

      // 時間は連続しているが日付が異なるため結合されないことを確認
      expect(result.current.timeSlots).toHaveLength(2)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T23:30:00',
        endTime: '2025-07-04T23:59:00'
      })
      expect(result.current.timeSlots[1]).toMatchObject({
        startTime: '2025-07-05T00:00:00',
        endTime: '2025-07-05T00:30:00'
      })
    })

    it('非連続の時間スロットは結合しない', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 非連続の時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T10:30:00')
      })
      
      act(() => {
        result.current.addTimeSlot('2025-07-04T11:00:00', '2025-07-04T11:30:00')
      })

      // 結合されず2つのスロットが残ることを確認
      expect(result.current.timeSlots).toHaveLength(2)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T10:30:00'
      })
      expect(result.current.timeSlots[1]).toMatchObject({
        startTime: '2025-07-04T11:00:00',
        endTime: '2025-07-04T11:30:00'
      })
    })

    it('3つの連続する時間スロットを正しく結合する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 3つの連続する時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T10:30:00')
      })
      
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:30:00', '2025-07-04T11:00:00')
      })
      
      act(() => {
        result.current.addTimeSlot('2025-07-04T11:00:00', '2025-07-04T11:30:00')
      })

      // 全て結合されて1つのスロットになることを確認
      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T11:30:00'
      })
    })
  })

  describe('addTimeSlot', () => {
    it('新しい時間スロットを追加する', () => {
      const { result } = renderHook(() => useScheduleForm())

      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T11:00:00')
      })

      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T11:00:00'
      })
      expect(result.current.timeSlots[0].id).toBeDefined()
    })

    it('デフォルト値で時間スロットを追加する', () => {
      const { result } = renderHook(() => useScheduleForm())

      act(() => {
        result.current.addTimeSlot()
      })

      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '',
        endTime: ''
      })
    })
  })

  describe('addTimeSlotsWithMerge', () => {
    it('重複する時間スロットを結合する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 最初に10:00-11:00を追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T11:00:00')
      })

      // 重複する10:30-12:00を追加（10:00-12:00に結合されるべき）
      act(() => {
        result.current.addTimeSlotsWithMerge([
          { startTime: '2025-07-04T10:30:00', endTime: '2025-07-04T12:00:00' }
        ])
      })

      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T12:00:00'
      })
    })

    it('完全に重複する時間スロットを結合する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 最初に10:00-12:00を追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T12:00:00')
      })

      // 完全に包含される11:00-11:30を追加（変化なしのはず）
      act(() => {
        result.current.addTimeSlotsWithMerge([
          { startTime: '2025-07-04T11:00:00', endTime: '2025-07-04T11:30:00' }
        ])
      })

      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T12:00:00'
      })
    })

    it('複数の既存スロットと新規スロットを結合する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 最初に2つの離れたスロットを追加
      act(() => {
        result.current.addTimeSlots([
          { startTime: '2025-07-04T10:00:00', endTime: '2025-07-04T11:00:00' },
          { startTime: '2025-07-04T14:00:00', endTime: '2025-07-04T15:00:00' }
        ])
      })

      // 中間をつなぐスロットを追加（全て結合されるべき）
      act(() => {
        result.current.addTimeSlotsWithMerge([
          { startTime: '2025-07-04T11:00:00', endTime: '2025-07-04T14:00:00' }
        ])
      })

      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T15:00:00'
      })
    })

    it('日付跨ぎスロットでも重複チェックして結合する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 最初に当日の一部を追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T20:00:00', '2025-07-04T22:30:00')
      })

      // 日付跨ぎで重複するスロットを追加
      act(() => {
        result.current.addTimeSlotsWithMerge([
          { startTime: '2025-07-04T22:00:00', endTime: '2025-07-04T23:59:00' },
          { startTime: '2025-07-05T00:00:00', endTime: '2025-07-05T01:00:00' }
        ])
      })

      // 当日分は結合され、翌日分は独立
      expect(result.current.timeSlots).toHaveLength(2)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T20:00:00',
        endTime: '2025-07-04T23:59:00'
      })
      expect(result.current.timeSlots[1]).toMatchObject({
        startTime: '2025-07-05T00:00:00',
        endTime: '2025-07-05T01:00:00'
      })
    })
  })

  describe('addTimeSlots', () => {
    it('複数の時間スロットを一度に追加する', () => {
      const { result } = renderHook(() => useScheduleForm())

      act(() => {
        result.current.addTimeSlots([
          { startTime: '2025-07-04T10:00:00', endTime: '2025-07-04T11:00:00' },
          { startTime: '2025-07-04T14:00:00', endTime: '2025-07-04T15:00:00' }
        ])
      })

      expect(result.current.timeSlots).toHaveLength(2)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T11:00:00'
      })
      expect(result.current.timeSlots[1]).toMatchObject({
        startTime: '2025-07-04T14:00:00',
        endTime: '2025-07-04T15:00:00'
      })
    })

    it('日付跨ぎの時間スロットを正しく追加する', () => {
      const { result } = renderHook(() => useScheduleForm())

      act(() => {
        result.current.addTimeSlots([
          { startTime: '2025-07-04T22:00:00', endTime: '2025-07-04T23:59:00' },
          { startTime: '2025-07-05T00:00:00', endTime: '2025-07-05T01:00:00' }
        ])
      })

      // 日付が異なるため結合されず、2つのスロットが保持される
      expect(result.current.timeSlots).toHaveLength(2)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T22:00:00',
        endTime: '2025-07-04T23:59:00'
      })
      expect(result.current.timeSlots[1]).toMatchObject({
        startTime: '2025-07-05T00:00:00',
        endTime: '2025-07-05T01:00:00'
      })
    })

    it('連続する時間スロットは結合される', () => {
      const { result } = renderHook(() => useScheduleForm())

      act(() => {
        result.current.addTimeSlots([
          { startTime: '2025-07-04T10:00:00', endTime: '2025-07-04T10:30:00' },
          { startTime: '2025-07-04T10:30:00', endTime: '2025-07-04T11:00:00' }
        ])
      })

      // 同じ日付内の連続する時間スロットは結合される
      expect(result.current.timeSlots).toHaveLength(1)
      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T10:00:00',
        endTime: '2025-07-04T11:00:00'
      })
    })
  })

  describe('removeTimeSlot', () => {
    it('指定されたIDの時間スロットを削除する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T11:00:00')
      })

      const slotId = result.current.timeSlots[0].id

      // 削除実行
      act(() => {
        result.current.removeTimeSlot(slotId)
      })

      expect(result.current.timeSlots).toHaveLength(0)
    })
  })

  describe('updateTimeSlot', () => {
    it('指定されたIDの時間スロットを更新する', () => {
      const { result } = renderHook(() => useScheduleForm())

      // 時間スロットを追加
      act(() => {
        result.current.addTimeSlot('2025-07-04T10:00:00', '2025-07-04T11:00:00')
      })

      const slotId = result.current.timeSlots[0].id

      // 開始時刻を更新
      act(() => {
        result.current.updateTimeSlot(slotId, 'startTime', '2025-07-04T09:00:00')
      })

      expect(result.current.timeSlots[0]).toMatchObject({
        startTime: '2025-07-04T09:00:00',
        endTime: '2025-07-04T11:00:00'
      })
    })
  })
})