/**
 * メッセージ・文言関連の定数
 */

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  /** URLコピー完了メッセージ */
  URL_COPIED: 'URLをコピーしました',
  /** スケジュール作成完了 */
  SCHEDULE_CREATED: 'スケジュールを作成しました',
  /** スケジュール更新完了 */
  SCHEDULE_UPDATED: 'スケジュールを更新しました',
} as const

// エラーメッセージ
export const ERROR_MESSAGES = {
  /** 無効なスケジュールID */
  INVALID_SCHEDULE_ID: '無効なスケジュールIDです',
  /** 無効な編集トークン */
  INVALID_EDIT_TOKEN: '無効な編集トークンです',
  /** API通信エラー */
  API_ERROR: 'サーバーとの通信でエラーが発生しました',
  /** 不正なAPIレスポンス */
  INVALID_API_RESPONSE: 'APIレスポンスの形式が不正です',
} as const

// ボタン・アクション関連のテキスト
export const BUTTON_TEXTS = {
  /** 作成ボタン */
  CREATE: '作成',
  /** 作成中のローディング */
  CREATING: '作成中...',
  /** 更新ボタン */
  UPDATE: '更新',
  /** 削除ボタン */
  DELETE: '削除',
  /** キャンセルボタン */
  CANCEL: 'キャンセル',
  /** 保存ボタン */
  SAVE: '保存',
} as const

// プレースホルダー・デフォルト値
export const PLACEHOLDERS = {
  /** スケジュールコメントのプレビュー */
  SCHEDULE_PREVIEW: 'プレビュー',
  /** 読み込み中 */
  LOADING: '読み込み中...',
  /** カレンダー読み込み中 */
  CALENDAR_LOADING: 'Loading calendar...',
} as const

// ナビゲーション関連
export const NAVIGATION = {
  /** 前週 */
  PREVIOUS_WEEK: '前の週',
  /** 今週 */
  CURRENT_WEEK: '今週',
  /** 次週 */
  NEXT_WEEK: '次の週',
} as const