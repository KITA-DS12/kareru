import { generateMetadata, generateScheduleMetadata, generateEditMetadata, generateNotFoundMetadata } from './seo-metadata'

describe('SEO Metadata Utils', () => {
  describe('generateMetadata', () => {
    it('should generate default metadata', () => {
      const metadata = generateMetadata()
      
      expect(metadata.title).toBe('Kareru - 手軽な日程共有サービス')
      expect(metadata.description).toBe('手軽にスケジュールを作成・共有できるサービスです。UUID付きURLで安全にスケジュールを共有し、編集権限も管理できます。')
      expect(metadata.keywords).toContain('スケジュール')
      expect(metadata.openGraph.title).toBe('Kareru - 手軽な日程共有サービス')
      expect(metadata.twitter.card).toBe('summary')
    })

    it('should generate custom metadata', () => {
      const customTitle = 'カスタムタイトル'
      const customDescription = 'カスタム説明'
      
      const metadata = generateMetadata(customTitle, customDescription)
      
      expect(metadata.title).toBe(customTitle)
      expect(metadata.description).toBe(customDescription)
      expect(metadata.openGraph.title).toBe(customTitle)
      expect(metadata.openGraph.description).toBe(customDescription)
    })
  })

  describe('generateScheduleMetadata', () => {
    it('should generate schedule-specific metadata', () => {
      const scheduleId = 'ee284ba1-ecbe-4997-ae7e-3877b2cd7db7'
      const comment = 'チームミーティング'
      
      const metadata = generateScheduleMetadata(scheduleId, comment)
      
      expect(metadata.title).toContain('チームミーティング')
      expect(metadata.description).toContain('チームミーティング')
      expect(metadata.openGraph.url).toContain(scheduleId)
      expect(metadata.robots).toBe('noindex, nofollow')
    })

    it('should handle empty comment', () => {
      const scheduleId = 'ee284ba1-ecbe-4997-ae7e-3877b2cd7db7'
      
      const metadata = generateScheduleMetadata(scheduleId)
      
      expect(metadata.title).toBe('スケジュール表示 - Kareru')
      expect(metadata.description).toContain('スケジュール情報')
    })
  })

  describe('generateEditMetadata', () => {
    it('should generate edit page metadata', () => {
      const metadata = generateEditMetadata()
      
      expect(metadata.title).toBe('スケジュール編集 - Kareru')
      expect(metadata.description).toContain('編集画面')
      expect(metadata.robots).toBe('noindex, nofollow')
    })
  })

  describe('generateNotFoundMetadata', () => {
    it('should generate 404 page metadata', () => {
      const metadata = generateNotFoundMetadata()
      
      expect(metadata.title).toBe('ページが見つかりません - Kareru')
      expect(metadata.description).toContain('404')
      expect(metadata.robots).toBe('noindex, nofollow')
    })
  })
})