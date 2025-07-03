'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/create')
    }, 2000)

    return () => clearTimeout(redirectTimer)
  }, [router])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Kareru
        </h1>
        <p className="text-gray-600 mb-4">
          手軽な日程共有サービス
        </p>
        
        <div className="mb-8">
          <div data-testid="loading-spinner" className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-blue-600 font-medium">リダイレクト中...</p>
          <p className="text-gray-500 text-sm mt-2">
            スケジュール作成ページに移動します
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/create" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            今すぐ作成
          </Link>
        </div>
      </div>
    </main>
  )
}