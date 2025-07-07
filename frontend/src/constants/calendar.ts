/**
 * カレンダー関連の定数
 */

// 時間関連の定数
export const TIME_CONSTANTS = {
  /** 1日の時間数 */
  HOURS_PER_DAY: 24,
  /** 1時間の分数 */
  MINUTES_PER_HOUR: 60,
  /** タイムスロット間隔（分） */
  TIME_SLOT_INTERVAL_MINUTES: 30,
  /** 1日のタイムスロット数（24時間 × 2スロット/時間） */
  TOTAL_TIME_SLOTS_PER_DAY: 48,
  /** 1週間の日数 */
  DAYS_PER_WEEK: 7,
} as const

// UI関連の定数
export const UI_CONSTANTS = {
  /** タイムスロットの高さ（px） */
  TIME_SLOT_HEIGHT_PX: 32,
  /** エラーメッセージ表示時間（ms） */
  ERROR_MESSAGE_DURATION_MS: 3000,
  /** カレンダーグリッドの列数（時刻列 + 7日） */
  CALENDAR_GRID_COLUMNS: 8,
  /** イベントバーの最小高さ（px） */
  MIN_EVENT_HEIGHT_PX: 20,
  /** カレンダーの高さ（px） */
  CALENDAR_HEIGHT_PX: 400,
  /** 現在時刻インジケーターの高さ（px） */
  CURRENT_TIME_INDICATOR_HEIGHT_PX: 2,
  /** 列幅のパーセンテージ */
  COLUMN_WIDTH_PERCENTAGE: 12.5,
} as const

// ビジネスロジック関連の定数
export const BUSINESS_CONSTANTS = {
  /** スケジュール有効期限（日） */
  SCHEDULE_EXPIRY_DAYS: 7,
  /** 編集トークンの文字数 */
  EDIT_TOKEN_LENGTH: 64,
  /** UUIDバージョン */
  UUID_VERSION: 4,
  /** 日本時間のUTCオフセット（時間） */
  JST_UTC_OFFSET_HOURS: 9,
} as const

// 日本語の曜日
export const WEEKDAYS_JP = ['日', '月', '火', '水', '木', '金', '土'] as const

// DurationModeの選択肢
export const DURATION_MODES = {
  THIRTY_MINUTES: '30min',
  ONE_HOUR: '1h', 
  THREE_HOURS: '3h',
  ONE_DAY: '1day',
} as const

// DurationModeに対応するスロット数
export const DURATION_SLOTS = {
  [DURATION_MODES.THIRTY_MINUTES]: 1,
  [DURATION_MODES.ONE_HOUR]: 2,
  [DURATION_MODES.THREE_HOURS]: 6,
  [DURATION_MODES.ONE_DAY]: 48,
} as const