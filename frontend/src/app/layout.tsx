import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kareru - 手軽な日程共有',
  description: 'ログイン不要で空き日程をすぐ公開・共有',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}