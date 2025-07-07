/**
 * API関連の定数
 */

// APIエンドポイント
export const API_ENDPOINTS = {
  /** スケジュール作成・取得のベースパス */
  SCHEDULES: '/api/v1/schedules',
  /** 編集用のパス */
  EDIT: '/edit',
} as const

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

// API設定
export const API_CONFIG = {
  /** デフォルトのタイムアウト（ms） */
  DEFAULT_TIMEOUT_MS: 10000,
  /** リトライ回数 */
  RETRY_COUNT: 3,
} as const