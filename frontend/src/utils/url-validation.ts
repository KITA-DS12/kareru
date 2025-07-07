import { BUSINESS_CONSTANTS } from '../constants'

/**
 * UUID v4の形式を検証する
 * @param uuid 検証対象の値（unknown型で任意の値を受け取る）
 * @returns UUIDとして有効かどうか
 */
export function isValidUUID(uuid: unknown): boolean {
  if (typeof uuid !== 'string') {
    return false
  }
  
  const uuidRegex = new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${BUSINESS_CONSTANTS.UUID_VERSION}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, 'i')
  return uuidRegex.test(uuid)
}

/**
 * 編集トークンの形式を検証する（64文字の16進数）
 * @param token 検証対象の値（unknown型で任意の値を受け取る）
 * @returns 編集トークンとして有効かどうか
 */
export function isValidEditToken(token: unknown): boolean {
  if (typeof token !== 'string') {
    return false
  }
  
  const tokenRegex = new RegExp(`^[0-9a-f]{${BUSINESS_CONSTANTS.EDIT_TOKEN_LENGTH}}$`, 'i')
  return tokenRegex.test(token)
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean
  error: string | null
}

/**
 * スケジュールURLのバリデーション
 */
export function validateScheduleURL(uuid: string): ValidationResult {
  if (!isValidUUID(uuid)) {
    return {
      isValid: false,
      error: '無効なスケジュールIDです'
    }
  }
  
  return {
    isValid: true,
    error: null
  }
}

/**
 * 編集URLのバリデーション
 */
export function validateEditURL(token: string): ValidationResult {
  if (!isValidEditToken(token)) {
    return {
      isValid: false,
      error: '無効な編集トークンです'
    }
  }
  
  return {
    isValid: true,
    error: null
  }
}