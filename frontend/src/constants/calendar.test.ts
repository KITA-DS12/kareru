/**
 * カレンダー定数のテスト
 * 外部化された定数が正しく動作することを確認
 */

import { TIME_CONSTANTS, UI_CONSTANTS, BUSINESS_CONSTANTS, WEEKDAYS_JP } from './calendar'

describe('Calendar Constants Usage', () => {
  describe('Time Constants', () => {
    it('1日は24時間である', () => {
      expect(TIME_CONSTANTS.HOURS_PER_DAY).toBe(24)
      
      // タイムスロット生成で使用される値と一致することを確認
      const timeSlots = []
      for (let hour = 0; hour < TIME_CONSTANTS.HOURS_PER_DAY; hour++) {
        timeSlots.push(hour)
      }
      expect(timeSlots).toHaveLength(24)
    })

    it('1時間は60分である', () => {
      expect(TIME_CONSTANTS.MINUTES_PER_HOUR).toBe(60)
      
      // 30分刻みのスロット生成で使用される値と一致することを確認
      const slotsPerHour = TIME_CONSTANTS.MINUTES_PER_HOUR / 30
      expect(slotsPerHour).toBe(2)
    })

    it('タイムスロット間隔は30分である', () => {
      expect(TIME_CONSTANTS.TIME_SLOT_INTERVAL_MINUTES).toBe(30)
      
      // 1日のスロット数計算
      const totalSlots = (TIME_CONSTANTS.HOURS_PER_DAY * TIME_CONSTANTS.MINUTES_PER_HOUR) / TIME_CONSTANTS.TIME_SLOT_INTERVAL_MINUTES
      expect(totalSlots).toBe(48)
    })

    it('1日のタイムスロット数は48である', () => {
      expect(TIME_CONSTANTS.TOTAL_TIME_SLOTS_PER_DAY).toBe(48)
      
      // 24時間 × 2スロット/時間 = 48スロット
      expect(TIME_CONSTANTS.TOTAL_TIME_SLOTS_PER_DAY).toBe(TIME_CONSTANTS.HOURS_PER_DAY * 2)
    })

    it('1週間は7日である', () => {
      expect(TIME_CONSTANTS.DAYS_PER_WEEK).toBe(7)
      
      // 週日付配列の長さと一致することを確認
      expect(WEEKDAYS_JP).toHaveLength(TIME_CONSTANTS.DAYS_PER_WEEK)
    })
  })

  describe('UI Constants', () => {
    it('タイムスロットの高さは32pxである', () => {
      expect(UI_CONSTANTS.TIME_SLOT_HEIGHT_PX).toBe(32)
      
      // CSSクラスやスタイル計算で使用される値
      const calculatedHeight = UI_CONSTANTS.TIME_SLOT_HEIGHT_PX * 2 // 1時間分
      expect(calculatedHeight).toBe(64)
    })

    it('エラーメッセージ表示時間は3秒である', () => {
      expect(UI_CONSTANTS.ERROR_MESSAGE_DURATION_MS).toBe(3000)
      
      // setTimeout で使用される値
      const seconds = UI_CONSTANTS.ERROR_MESSAGE_DURATION_MS / 1000
      expect(seconds).toBe(3)
    })

    it('カレンダーグリッドは8列である', () => {
      expect(UI_CONSTANTS.CALENDAR_GRID_COLUMNS).toBe(8)
      
      // 時刻列(1) + 週7日(7) = 8列
      expect(UI_CONSTANTS.CALENDAR_GRID_COLUMNS).toBe(1 + 7)
    })

    it('イベントバーの最小高さは20pxである', () => {
      expect(UI_CONSTANTS.MIN_EVENT_HEIGHT_PX).toBe(20)
      
      // UI設計での最小タッチ可能サイズ
      expect(UI_CONSTANTS.MIN_EVENT_HEIGHT_PX).toBeGreaterThanOrEqual(16)
    })
  })

  describe('Business Logic Constants', () => {
    it('スケジュール有効期限は7日である', () => {
      expect(BUSINESS_CONSTANTS.SCHEDULE_EXPIRY_DAYS).toBe(7)
      
      // 1週間後の日付計算
      const now = new Date()
      const expiryDate = new Date(now)
      expiryDate.setDate(expiryDate.getDate() + BUSINESS_CONSTANTS.SCHEDULE_EXPIRY_DAYS)
      
      const daysDiff = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      expect(daysDiff).toBe(7)
    })

    it('編集トークンは64文字である', () => {
      expect(BUSINESS_CONSTANTS.EDIT_TOKEN_LENGTH).toBe(64)
      
      // セキュリティ要件：十分な長さのランダム文字列
      expect(BUSINESS_CONSTANTS.EDIT_TOKEN_LENGTH).toBeGreaterThanOrEqual(32)
    })
  })
})