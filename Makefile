.PHONY: help up down restart status logs clean db dev

# デフォルトターゲット
help:
	@echo "Available commands:"
	@echo "  make up        - Start all services (DB)"
	@echo "  make down      - Stop all services"
	@echo "  make restart   - Restart all services"
	@echo "  make status    - Show service status"
	@echo "  make logs      - Show logs for all services"
	@echo "  make clean     - Stop and remove all containers and volumes"
	@echo ""
	@echo "Individual services:"
	@echo "  make db        - Start only database"
	@echo ""
	@echo "Development:"
	@echo "  make dev       - Start services + applications"

# 全サービス起動
up:
	@echo "🚀 Starting all services..."
	docker compose -f compose.yml up db -d
	@echo "✅ Services started!"
	@echo "📊 Database: localhost:55432"

# 全サービス停止
down:
	@echo "🛑 Stopping all services..."
	docker compose -f compose.yml down
	@echo "✅ All services stopped!"

# 全サービス再起動
restart: down up

# サービス状態確認
status:
	@echo "📊 Service status:"
	docker compose -f compose.yml ps

# ログ表示
logs:
	docker compose -f compose.yml logs -f

# DB単体起動
db:
	@echo "🗄️ Starting database..."
	docker compose -f compose.yml up db -d
	@echo "✅ Database started on localhost:55432"

# 開発環境起動（サービス + アプリケーション）
dev: up
	@echo "🏗️ Starting applications..."
	pnpm dev

# クリーンアップ（コンテナとボリューム削除）
clean:
	@echo "🧹 Cleaning up containers and volumes..."
	docker compose -f compose.yml down -v --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed!"
