import { renderHook, act } from '@testing-library/react'
import useCalendarNavigation from './useCalendarNavigation'

describe('useCalendarNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useCalendarNavigation())
    
    expect(result.current.displayDate).toBeInstanceOf(Date)
    expect(typeof result.current.goToPreviousWeek).toBe('function')
    expect(typeof result.current.goToNextWeek).toBe('function')
    expect(typeof result.current.goToCurrentWeek).toBe('function')
    expect(typeof result.current.getWeekRange).toBe('function')
    expect(Array.isArray(result.current.weekDates)).toBe(true)
    expect(typeof result.current.todayColumnIndex).toBe('number')
    expect(typeof result.current.isClient).toBe('boolean')
  })

  it('週ナビゲーション関数が正しく動作する', () => {
    const initialDate = new Date('2024-07-15') // 月曜日
    const { result } = renderHook(() => useCalendarNavigation(initialDate))
    
    const initialDisplayDate = result.current.displayDate
    
    act(() => {
      result.current.goToPreviousWeek()
    })
    
    const previousWeekDate = result.current.displayDate
    expect(previousWeekDate.getTime()).toBeLessThan(initialDisplayDate.getTime())
    
    act(() => {
      result.current.goToNextWeek()
    })
    
    // 元の日付に戻る
    expect(result.current.displayDate.getTime()).toBe(initialDisplayDate.getTime())
  })

  it('前週・次週ボタンが日付を正しく変更する', () => {
    const { result } = renderHook(() => useCalendarNavigation(new Date('2024-07-15')))
    
    const initialDate = result.current.displayDate
    
    act(() => {
      result.current.goToPreviousWeek()
    })
    
    const previousDate = result.current.displayDate
    expect(previousDate.getTime()).toBe(initialDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    act(() => {
      result.current.goToNextWeek()
    })
    
    // 元の日付に戻ることを確認
    const backToInitialDate = result.current.displayDate
    expect(backToInitialDate.getTime()).toBe(initialDate.getTime())
  })

  it('今週ボタンが現在日時にリセットする', () => {
    const { result } = renderHook(() => useCalendarNavigation(new Date('2024-07-15')))
    
    act(() => {
      result.current.goToPreviousWeek()
    })
    
    // 前週に移動した後
    expect(result.current.displayDate.getTime()).not.toBe(new Date().getTime())
    
    act(() => {
      result.current.goToCurrentWeek()
    })
    
    // 今週に戻る（近似値で確認）
    const timeDiff = Math.abs(result.current.displayDate.getTime() - new Date().getTime())
    expect(timeDiff).toBeLessThan(1000) // 1秒以内の差
  })

  it('週範囲取得が正しい文字列を返す', () => {
    const { result } = renderHook(() => useCalendarNavigation())
    
    const weekRange = result.current.getWeekRange()
    
    expect(typeof weekRange.start).toBe('string')
    expect(typeof weekRange.end).toBe('string')
  })

  it('週日付配列が正しく生成される', () => {
    const { result } = renderHook(() => useCalendarNavigation())
    
    expect(result.current.weekDates).toHaveLength(7)
    result.current.weekDates.forEach(date => {
      expect(date).toBeInstanceOf(Date)
    })
  })

  it('今日の列インデックスが正しく計算される', () => {
    const { result } = renderHook(() => useCalendarNavigation())
    
    expect(result.current.todayColumnIndex).toBeGreaterThanOrEqual(-1)
    expect(result.current.todayColumnIndex).toBeLessThan(7)
  })
})