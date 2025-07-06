/**
 * 日本時間（JST）処理のユーティリティ関数
 * タイムゾーンライブラリを使わずに正確な日本時間処理を提供
 */

/**
 * 現在の日本時間を取得
 */
export function getJSTNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
}

/**
 * UTCのDateオブジェクトを日本時間のDateオブジェクトに変換
 */
export function utcToJST(utcDate: Date): Date {
  return new Date(utcDate.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
}

/**
 * 日本時間のDateオブジェクトをUTCのDateオブジェクトに変換
 */
export function jstToUTC(jstDate: Date): Date {
  // 日本時間として扱っているDateオブジェクトを、実際にはUTCとして作成
  const utcTime = jstDate.getTime() - (jstDate.getTimezoneOffset() * 60000) - (9 * 60 * 60000)
  return new Date(utcTime)
}

/**
 * 日本時間での今日の日付（0時0分0秒）を取得
 */
export function getJSTToday(): Date {
  const jstNow = getJSTNow()
  return new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())
}

/**
 * 日本時間での今週の開始日（日曜日 0時0分0秒）を取得
 */
export function getJSTWeekStart(baseDate?: Date): Date {
  const referenceDate = baseDate ? utcToJST(baseDate) : getJSTNow()
  // 日本時間での日付を正確に作成するため、ISO文字列経由で作成
  const dateString = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}-${String(referenceDate.getDate()).padStart(2, '0')}T00:00:00+09:00`
  const startOfWeek = new Date(dateString)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  return startOfWeek
}

/**
 * 日本時間での週の日付配列を取得（日曜日から土曜日まで）
 */
export function getJSTWeekDates(baseDate?: Date): Date[] {
  const startOfWeek = getJSTWeekStart(baseDate)
  return Array.from({ length: 7 }, (_, i) => {
    // 日本時間での日付を正確に作成
    const jstStartDate = utcToJST(startOfWeek)
    const targetYear = jstStartDate.getFullYear()
    const targetMonth = jstStartDate.getMonth()
    const targetDay = jstStartDate.getDate() + i
    
    // 日本時間でのISO文字列を作成して正確な日付を生成
    const targetDate = new Date(targetYear, targetMonth, targetDay)
    const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}T00:00:00+09:00`
    return new Date(dateString)
  })
}

/**
 * 時間（HH:MM）を分数に変換
 * ISO形式の時間文字列から正確な分数を計算
 */
export function timeToMinutes(timeString: string): number {
  const date = new Date(timeString)
  // ISO文字列の場合、直接UTCとして解析されるので、日本時間に変換
  const jstDate = utcToJST(date)
  return jstDate.getHours() * 60 + jstDate.getMinutes()
}

/**
 * 簡単な時間文字列（HH:MM）から分数に変換
 * フォーム入力などの単純な時間文字列用
 */
export function simpleTimeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * 分数を時間（HH:MM）に変換（日本時間ベース）
 */
export function minutesToJSTTime(minutes: number, baseDate: Date): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const result = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, mins)
  return jstToUTC(result).toISOString().slice(0, 19)
}

/**
 * 現在の日本時間での時刻を分数で取得
 */
export function getCurrentJSTMinutes(): number {
  const now = getJSTNow()
  return now.getHours() * 60 + now.getMinutes()
}

/**
 * 日本時間で今日かどうかをチェック
 */
export function isJSTToday(date: Date): boolean {
  const today = getJSTToday()
  const checkDate = utcToJST(date)
  return checkDate.toDateString() === today.toDateString()
}

/**
 * スロットインデックス（30分単位）から日本時間のDateオブジェクトを作成
 */
export function slotIndexToJSTDate(dayDate: Date, slotIndex: number): Date {
  const minutes = slotIndex * 30
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  // 日本時間で正確な日付時刻を作成
  // dayDateから日本時間の年月日を取得し、指定された時分と組み合わせ
  const jstDate = utcToJST(dayDate)
  const dateString = `${jstDate.getFullYear()}-${String(jstDate.getMonth() + 1).padStart(2, '0')}-${String(jstDate.getDate()).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00+09:00`
  const result = new Date(dateString)
  
  console.log(`slotIndexToJSTDate Debug: dayDate=${dayDate.toISOString()}, jstDate=${jstDate.toISOString()}, slotIndex=${slotIndex}, result=${result.toISOString()}`)
  
  return result
}

/**
 * 日本時間表示用のフォーマット（HH:MM）
 */
export function formatJSTTime(date: Date): string {
  const jstDate = utcToJST(date)
  return jstDate.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

/**
 * デバッグ用：現在の時刻情報を表示
 */
export function debugTimeInfo() {
  const systemNow = new Date()
  const jstNow = getJSTNow()
  
  console.log('=== TIME DEBUG INFO ===')
  console.log('System time:', systemNow.toISOString())
  console.log('JST time:', jstNow.toISOString())
  console.log('JST formatted:', formatJSTTime(systemNow))
  console.log('Current JST minutes:', getCurrentJSTMinutes())
  console.log('======================')
}