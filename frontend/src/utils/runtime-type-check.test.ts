import { isCreateScheduleResponse, isSchedule, isAPIErrorResponse } from './runtime-type-check'

describe('Runtime Type Check', () => {
  describe('isCreateScheduleResponse', () => {
    it('有効なCreateScheduleResponseを正しく識別する', () => {
      const validResponse = {
        id: 'ee284ba1-ecbe-4997-ae7e-3877b2cd7db7',
        editToken: '5b521bc840d1b9d806dc97cb8efb5d6a41d0e737379fcd591f485e27b54f48fa',
        comment: 'テストスケジュール',
        timeSlots: [
          {
            id: 'slot1',
            StartTime: '2024-07-15T10:00:00Z',
            EndTime: '2024-07-15T11:00:00Z',
            Available: true
          }
        ],
        createdAt: '2024-07-15T09:00:00Z',
        expiresAt: '2024-07-22T09:00:00Z'
      }

      expect(isCreateScheduleResponse(validResponse)).toBe(true)
    })

    it('無効なCreateScheduleResponseを正しく識別する', () => {
      const invalidResponses = [
        null,
        undefined,
        {},
        { id: 123 }, // idが数値
        { id: 'valid', editToken: null }, // editTokenがnull
        { id: 'valid', editToken: 'valid', timeSlots: 'invalid' }, // timeSlotsが配列でない
      ]

      invalidResponses.forEach(response => {
        expect(isCreateScheduleResponse(response)).toBe(false)
      })
    })
  })

  describe('isSchedule', () => {
    it('有効なScheduleを正しく識別する', () => {
      const validSchedule = {
        id: 'ee284ba1-ecbe-4997-ae7e-3877b2cd7db7',
        comment: 'テストスケジュール',
        timeSlots: [
          {
            id: 'slot1',
            StartTime: '2024-07-15T10:00:00Z',
            EndTime: '2024-07-15T11:00:00Z',
            Available: true
          }
        ],
        createdAt: '2024-07-15T09:00:00Z',
        expiresAt: '2024-07-22T09:00:00Z'
      }

      expect(isSchedule(validSchedule)).toBe(true)
    })

    it('無効なScheduleを正しく識別する', () => {
      const invalidSchedules = [
        null,
        undefined,
        'string',
        123,
        {},
        { id: 'valid' }, // 必須フィールド不足
        { id: 'valid', comment: 'valid', timeSlots: null }, // timeSlotsがnull
      ]

      invalidSchedules.forEach(schedule => {
        expect(isSchedule(schedule)).toBe(false)
      })
    })
  })

  describe('isAPIErrorResponse', () => {
    it('有効なAPIErrorResponseを正しく識別する', () => {
      const validError = {
        error: 'Not Found',
        message: 'スケジュールが見つかりません'
      }

      expect(isAPIErrorResponse(validError)).toBe(true)
    })

    it('messageなしのAPIErrorResponseも有効とする', () => {
      const validError = {
        error: 'Internal Server Error'
      }

      expect(isAPIErrorResponse(validError)).toBe(true)
    })

    it('無効なAPIErrorResponseを正しく識別する', () => {
      const invalidErrors = [
        null,
        undefined,
        {},
        { message: 'エラーメッセージ' }, // errorフィールドなし
        { error: 123 }, // errorが文字列でない
      ]

      invalidErrors.forEach(error => {
        expect(isAPIErrorResponse(error)).toBe(false)
      })
    })
  })
})