# Kareru

Kakeruは、ログイン不要で手軽に日程共有ができるWebアプリケーションです。

## 特徴

- **ログイン不要**: アカウント作成や認証なしで即座に利用開始
- **UUID付きURL**: 推測困難なURLによる限定公開
- **編集トークン**: 作成者のみが編集・削除可能
- **自動失効**: 7日後に自動的に無効化
- **柔軟な時間設定**: 30分/1時間/3時間/6時間刻みで選択可能
- **軽量**: SQLite組み込みで簡単セットアップ

## 技術構成

- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS
- **バックエンド**: Go + Gin + SQLite + GORM
- **開発環境**: Docker Compose
- **テスト**: Jest (Frontend) + Testify (Go)

## 開発環境セットアップ

### 前提条件
- Docker & Docker Compose
- Node.js 18+ (ローカル開発時)
- Go 1.21+ (ローカル開発時)

### Docker Compose での起動
```bash
# 全サービス起動
docker-compose up -d

# フロントエンド: http://localhost:3000
# バックエンドAPI: http://localhost:8080
```

### ローカル開発
```bash
# バックエンド
cd backend
go mod tidy
go run cmd/server/main.go

# フロントエンド（別ターミナル）
cd frontend
npm install
npm run dev
```

### テスト実行
```bash
# バックエンドテスト
cd backend
go test ./...

# フロントエンドテスト
cd frontend
npm test
```

## 使い方

1. 空き日程を登録
2. 生成されたURLを共有
3. 相手が空き日程を確認
4. 必要に応じて編集トークンで編集・削除
