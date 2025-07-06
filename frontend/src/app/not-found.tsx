import Link from 'next/link'
import { generateNotFoundMetadata } from '../utils/seo-metadata'

export async function generateMetadata() {
  return generateNotFoundMetadata()
}

export default function NotFound() {
  return (
    <div data-testid="not-found-page" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 mt-2">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            ホームに戻る
          </Link>
          
          <Link
            href="/create"
            className="inline-block w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors font-medium"
          >
            新しいスケジュールを作成
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>問題が続く場合は、URLが正しいか確認してください。</p>
        </div>
      </div>
    </div>
  )
}