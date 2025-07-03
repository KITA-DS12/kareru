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
```

### Lint & ビルド
```bash
make lint          # 全体のlint実行
make lint-backend  # Go fmt/vet
make lint-frontend # Next.js ESLint
make build         # 全体ビルド
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
├── edit/[token]/        # 編集画面 (トークン認証)
└── schedule/[uuid]/     # スケジュール表示画面
components/              # Reactコンポーネント
hooks/                   # カスタムフック
services/               # API通信
types/                  # TypeScript型定義
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

### API設計
- REST API (Gin)
- 編集はトークンベース認証
- Firestoreとのメモリリポジトリ両対応
- CORS設定済み

### テスト戦略
- バックエンド: 単体テスト (domain/handlers) + 統合テスト (infrastructure/routes)
- フロントエンド: Jest + React Testing Library
- Firestoreエミュレータ使用 (テスト時)