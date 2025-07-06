import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'スケジュール表示 - Kareru',
  description: 'スケジュールの詳細を確認できます',
  robots: 'noindex, nofollow',
}

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}