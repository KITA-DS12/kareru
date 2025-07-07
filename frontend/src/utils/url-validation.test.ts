import { isValidUUID, isValidEditToken, validateScheduleURL, validateEditURL } from './url-validation'

describe('URL Validation Utils', () => {
  describe('isValidUUID', () => {
    it('should return true for valid UUID v4', () => {
      const validUUID = 'ee284ba1-ecbe-4997-ae7e-3877b2cd7db7'
      expect(isValidUUID(validUUID)).toBe(true)
    })

    it('should return false for invalid UUID format', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false)
      expect(isValidUUID('123-456-789')).toBe(false)
      expect(isValidUUID('')).toBe(false)
      expect(isValidUUID('ee284ba1-ecbe-4997-ae7e')).toBe(false)
    })

    it('should return false for non-string input', () => {
      expect(isValidUUID(null as unknown)).toBe(false)
      expect(isValidUUID(undefined as unknown)).toBe(false)
      expect(isValidUUID(123 as unknown)).toBe(false)
    })

    it('should handle unknown type inputs safely', () => {
      // 型安全性テスト: unknown型への変更後も正しく動作する
      const unknownInputs: unknown[] = [
        null, undefined, 123, true, [], {}, Symbol('test'), 
        new Date(), /regex/, () => {}, new Map(), new Set()
      ]
      
      unknownInputs.forEach(input => {
        expect(() => isValidUUID(input)).not.toThrow()
        expect(isValidUUID(input)).toBe(false)
      })
    })
  })

  describe('isValidEditToken', () => {
    it('should return true for valid edit token (64 hex characters)', () => {
      const validToken = '5b521bc840d1b9d806dc97cb8efb5d6a41d0e737379fcd591f485e27b54f48fa'
      expect(isValidEditToken(validToken)).toBe(true)
    })

    it('should return false for invalid edit token', () => {
      expect(isValidEditToken('short-token')).toBe(false)
      expect(isValidEditToken('')).toBe(false)
      expect(isValidEditToken('invalid-characters-!@#$')).toBe(false)
    })

    it('should return false for wrong length', () => {
      const shortToken = '5b521bc840d1b9d806dc97cb8efb5d6a41d0e737379fcd591f485e27b54f48f'
      const longToken = '5b521bc840d1b9d806dc97cb8efb5d6a41d0e737379fcd591f485e27b54f48faa'
      expect(isValidEditToken(shortToken)).toBe(false)
      expect(isValidEditToken(longToken)).toBe(false)
    })

    it('should handle unknown type inputs safely', () => {
      // 型安全性テスト: unknown型への変更後も正しく動作する
      const unknownInputs: unknown[] = [
        null, undefined, 123, true, [], {}, Symbol('test'),
        new Date(), /regex/, () => {}, new Map(), new Set()
      ]
      
      unknownInputs.forEach(input => {
        expect(() => isValidEditToken(input)).not.toThrow()
        expect(isValidEditToken(input)).toBe(false)
      })
    })
  })

  describe('validateScheduleURL', () => {
    it('should return valid for correct schedule URL', () => {
      const uuid = 'ee284ba1-ecbe-4997-ae7e-3877b2cd7db7'
      const result = validateScheduleURL(uuid)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should return invalid for malformed UUID', () => {
      const result = validateScheduleURL('invalid-uuid')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('無効なスケジュールIDです')
    })
  })

  describe('validateEditURL', () => {
    it('should return valid for correct edit token', () => {
      const token = '5b521bc840d1b9d806dc97cb8efb5d6a41d0e737379fcd591f485e27b54f48fa'
      const result = validateEditURL(token)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should return invalid for malformed edit token', () => {
      const result = validateEditURL('invalid-token')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('無効な編集トークンです')
    })
  })
})