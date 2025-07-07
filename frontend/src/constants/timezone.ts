/**
 * タイムゾーン関連の定数
 */

// タイムゾーン設定
export const TIMEZONE_CONFIG = {
  /** 日本時間のタイムゾーン */
  JAPAN_TIMEZONE: 'Asia/Tokyo',
  /** 日本時間のUTCオフセット（時間） */
  JST_UTC_OFFSET_HOURS: 9,
} as const

// ロケール設定
export const LOCALE_CONFIG = {
  /** 英語（アメリカ）ロケール */
  EN_US: 'en-US',
  /** 日本語ロケール */
  JA_JP: 'ja-JP',
} as const

// 時刻フォーマット設定
export const TIME_FORMAT_OPTIONS = {
  /** 2桁表示設定 */
  TWO_DIGIT: '2-digit',
  /** 数値表示設定 */
  NUMERIC: 'numeric',
} as const