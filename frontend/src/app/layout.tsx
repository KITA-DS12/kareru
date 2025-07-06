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
    <html lang="ja" className="dark">
      <body className="bg-gray-900 text-gray-100 min-h-screen">{children}</body>
    </html>
  )
}