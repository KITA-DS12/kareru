.PHONY: help
help: ## コマンド一覧を表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Docker関連
.PHONY: up
up: ## Docker Composeでサービスを起動
	docker-compose up -d

.PHONY: down
down: ## Docker Composeでサービスを停止
	docker-compose down

.PHONY: restart
restart: down up ## サービスを再起動

.PHONY: logs
logs: ## Docker Composeのログを表示
	docker-compose logs -f

.PHONY: ps
ps: ## 実行中のコンテナを表示
	docker-compose ps

# ビルド関連
.PHONY: build
build: build-backend build-frontend ## 全体をビルド

.PHONY: build-backend
build-backend: ## バックエンドをビルド
	cd backend && go build -o bin/server cmd/server/main.go

.PHONY: build-frontend
build-frontend: ## フロントエンドをビルド
	cd frontend && npm run build

# テスト関連
.PHONY: test
test: test-backend test-frontend ## 全テストを実行

.PHONY: test-backend
test-backend: ## バックエンドのテストを実行
	cd backend && go test -v ./...

.PHONY: test-frontend
test-frontend: ## フロントエンドのテストを実行
	cd frontend && npm test

.PHONY: test-all
test-all: test ## 全テストを実行（エイリアス）

# Lint関連
.PHONY: lint
lint: lint-backend lint-frontend ## 全体のlintを実行

.PHONY: lint-backend
lint-backend: ## バックエンドのlintを実行
	cd backend && go fmt ./...
	cd backend && go vet ./...

.PHONY: lint-frontend
lint-frontend: ## フロントエンドのlintを実行
	cd frontend && npm run lint

# 開発環境
.PHONY: dev
dev: ## 開発サーバーを起動（Docker使用）
	docker-compose up

.PHONY: dev-backend
dev-backend: ## バックエンドの開発サーバーを起動（ローカル）
	cd backend && go run cmd/server/main.go

.PHONY: dev-frontend
dev-frontend: ## フロントエンドの開発サーバーを起動（ローカル）
	cd frontend && npm run dev

# セットアップ
.PHONY: setup
setup: setup-backend setup-frontend ## 開発環境をセットアップ

.PHONY: setup-backend
setup-backend: ## バックエンドの依存関係をインストール
	cd backend && go mod download

.PHONY: setup-frontend
setup-frontend: ## フロントエンドの依存関係をインストール
	cd frontend && npm install

# クリーンアップ
.PHONY: clean
clean: ## ビルド成果物をクリーンアップ
	rm -rf backend/bin
	rm -rf frontend/.next
	rm -rf frontend/out
	docker-compose down -v