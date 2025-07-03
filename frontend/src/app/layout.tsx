import type { Metadata } from 'next'
import './globals.css'
import { generateMetadata } from '../utils/seo-metadata'

export const metadata: Metadata = generateMetadata()

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