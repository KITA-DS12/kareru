import { Metadata } from 'next'

/**
 * 基本のSEOメタデータを生成する
 */
export function generateMetadata(
  title: string = 'Kareru - 手軽な日程共有サービス',
  description: string = '手軽にスケジュールを作成・共有できるサービスです。UUID付きURLで安全にスケジュールを共有し、編集権限も管理できます。'
): Metadata {
  return {
    title,
    description,
    keywords: ['スケジュール', '日程調整', '共有', 'UUID', '編集', 'Kareru'],
    authors: [{ name: 'Kareru Team' }],
    creator: 'Kareru',
    publisher: 'Kareru',
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ja_JP',
      siteName: 'Kareru',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      creator: '@kareru',
    },
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#2563eb', // blue-600
  }
}

/**
 * スケジュール表示ページ用のメタデータを生成する
 */
export function generateScheduleMetadata(
  scheduleId: string,
  comment?: string
): Metadata {
  const title = comment ? `${comment} - スケジュール表示 - Kareru` : 'スケジュール表示 - Kareru'
  const description = comment 
    ? `「${comment}」のスケジュール情報をご確認いただけます。利用可能な時間帯をご確認ください。`
    : 'スケジュール情報をご確認いただけます。利用可能な時間帯をご確認ください。'

  return {
    ...generateMetadata(title, description),
    robots: 'noindex, nofollow', // プライベートコンテンツなので検索エンジンからは除外
    openGraph: {
      ...generateMetadata(title, description).openGraph,
      url: `/schedule/${scheduleId}`,
    },
  }
}

/**
 * 編集ページ用のメタデータを生成する
 */
export function generateEditMetadata(): Metadata {
  const title = 'スケジュール編集 - Kareru'
  const description = 'スケジュールの編集画面です。タイムスロットの利用可能状況を変更できます。'

  return {
    ...generateMetadata(title, description),
    robots: 'noindex, nofollow', // プライベートページなので検索エンジンからは除外
  }
}

/**
 * 404ページ用のメタデータを生成する
 */
export function generateNotFoundMetadata(): Metadata {
  const title = 'ページが見つかりません - Kareru'
  const description = '404エラー: お探しのページは存在しないか、移動された可能性があります。'

  return {
    ...generateMetadata(title, description),
    robots: 'noindex, nofollow', // エラーページなので検索エンジンからは除外
  }
}