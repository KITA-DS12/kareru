# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

### セットアップ
```bash
make setup          # 全体の依存関係をインストール
make setup-backend  # バックエンドのみ
make setup-frontend # フロントエンドのみ
```

### 開発サーバー起動
```bash
make dev             # Docker Composeで起動 (推奨)
make dev-backend     # バックエンドのみローカル起動
make dev-frontend    # フロントエンドのみローカル起動
```

### テスト実行
```bash
make test                      # 全テスト実行
make test-backend             # バックエンドテスト
make test-frontend            # フロントエンドテスト
make test-backend-unit        # バックエンド単体テストのみ
make test-backend-integration # バックエンド統合テストのみ

# 単一テストファイル実行
npm test -- --testPathPattern=useScheduleForm.test.tsx  # フロントエンド
cd backend && go test -v ./internal/handlers/schedule_test.go  # バックエンド
```

### Lint & ビルド
```bash
make lint          # 全体のlint実行
make lint-backend  # Go fmt/vet
make lint-frontend # Next.js ESLint
make build         # 全体ビルド

# TypeScript型チェック
npx tsc --noEmit   # フロントエンドのみ
```

### Docker関連
```bash
make up     # Docker Compose起動
make down   # Docker Compose停止
make logs   # ログ確認
make clean  # ビルド成果物削除
```

### テスト環境
- バックエンドテスト: `FIRESTORE_EMULATOR_HOST=localhost:8081` が必要
- Firestoreエミュレータログ: `make firestore-logs`
- テストデータ投入: `make seed`

## アーキテクチャ

### 技術スタック
- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS
- **バックエンド**: Go + Gin + Firestore
- **テスト**: Jest (React) + Testify (Go)
- **開発環境**: Docker Compose

### ディレクトリ構成

#### バックエンド (`backend/`)
```
internal/
├── domain/model/           # ドメインモデル (Schedule, TimeSlot)
├── handlers/              # HTTPハンドラー
├── infrastructure/
│   ├── firestore/         # Firestore接続
│   └── repository/        # データ永続化層
└── routes/               # ルーティング定義
cmd/
├── server/               # メインサーバー
├── seed/                 # テストデータ投入
└── check-firestore/      # Firestore接続確認
```

#### フロントエンド (`frontend/src/`)
```
app/                      # Next.js App Router
├── create/              # スケジュール作成画面
├── edit/[token]/        # 編集画面 (トークン認証) - 現在機能無効化
└── schedule/[uuid]/     # スケジュール表示画面
components/              # Reactコンポーネント
├── calendar/            # カレンダー関連コンポーネント
└── ...
hooks/                   # カスタムフック
services/               # API通信
types/                  # TypeScript型定義
utils/                  # ユーティリティ関数
```

### 主要なドメインモデル

#### Schedule
- `ID`: UUID v4 (公開URL用)
- `EditToken`: 64文字ランダム文字列 (編集権限)
- `TimeSlots`: 時間スロット配列
- `ExpiresAt`: 7日後自動失効

#### TimeSlot
- `StartTime`, `EndTime`: 時間範囲
- `Available`: 参加可能/不可フラグ
- オーバーラップ検証機能付き

### コア機能の設計思想

#### スケジュール作成フロー
1. `useScheduleForm` フックで状態管理
2. `CalendarGrid` でタイムスロット選択
3. 連続スロットの自動マージ機能
4. 重複検証とバリデーション
5. API経由でFirestore保存

#### タイムスロット管理
- `useTimeSlotManagement` で重複チェック機能のみ提供
- 編集機能は削除済み（時間枠クリック時の意図しない動作を防止）
- 連続・重複スロットの自動結合機能

#### 日時処理
- JST（日本時間）での一貫した処理
- UTCとJSTの変換ユーティリティ
- タイムゾーン考慮したスロット管理

### API設計
- REST API (Gin)
- 編集はトークンベース認証
- Firestoreとのメモリリポジトリ両対応
- CORS設定済み

### テスト戦略
- バックエンド: 単体テスト (domain/handlers) + 統合テスト (infrastructure/routes)
- フロントエンド: Jest + React Testing Library
- Firestoreエミュレータ使用 (テスト時)

## 重要な実装ノート

### 重要なファイル
- `frontend/src/hooks/useScheduleForm.ts`: スケジュール作成の中核ロジック
- `frontend/src/components/calendar/CalendarGrid.tsx`: カレンダーUI
- `backend/internal/domain/model/schedule.go`: ドメインモデル定義
- `backend/internal/handlers/schedule.go`: API ハンドラー
