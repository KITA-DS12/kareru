/**
 * UUID v4の形式を検証する
 */
export function isValidUUID(uuid: any): boolean {
  if (typeof uuid !== 'string') {
    return false
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * 編集トークンの形式を検証する（64文字の16進数）
 */
export function isValidEditToken(token: any): boolean {
  if (typeof token !== 'string') {
    return false
  }
  
  const tokenRegex = /^[0-9a-f]{64}$/i
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