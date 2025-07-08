# Kareru

Kareruは、ログイン不要で手軽に日程共有ができるWebアプリケーションです。

## 特徴

- **ログイン不要**: アカウント作成や認証なしで即座に利用開始
- **UUID付きURL**: 推測困難なURLによる限定公開
- **編集トークン**: 作成者のみが編集・削除可能
- **自動失効**: 7日後に自動的に無効化
- **柔軟な時間設定**: 30分/1時間/3時間/1日刻みで選択可能
- **軽量**: Firestore使用で簡単セットアップ

## 技術構成

- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS
- **バックエンド**: Go + Gin + Firestore
- **開発環境**: Docker Compose
- **テスト**: Jest (Frontend) + Testify (Go)

## 開発環境セットアップ

### 前提条件
- Docker & Docker Compose
- Node.js 18+ (ローカル開発時)
- Go 1.21+ (ローカル開発時)

### Make コマンド
```bash
# コマンド一覧を表示
make help
```

### Docker Compose での起動
```bash
# 全サービス起動
make up

# サービス停止
make down

# ログ確認
make logs

# フロントエンド: http://localhost:3000
# バックエンドAPI: http://localhost:8080
```

### ローカル開発
```bash
# 依存関係インストール
make setup

# バックエンド開発サーバー
make dev-backend

# フロントエンド開発サーバー（別ターミナル）
make dev-frontend
```

### テスト実行
```bash
# 全テスト実行
make test

# バックエンドテストのみ
make test-backend

# フロントエンドテストのみ
make test-frontend
```

### ビルド & Lint
```bash
# 全体ビルド
make build

# Lint実行
make lint
```

## 使い方

1. 空き日程を登録
2. 生成されたURLを共有
3. 相手が空き日程を確認
