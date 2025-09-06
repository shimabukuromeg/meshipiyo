# meshipiyo Backend

meshipiyoのバックエンドAPIサーバーです。GraphQL Yoga、Prisma ORM、PostgreSQLを使用して構築されています。

## 環境構築

### 必要な環境

- Node.js 20以上
- pnpm 9以上
- Docker & Docker Compose
- PostgreSQL 15（Dockerで提供）

### 初回セットアップ手順

1. **依存関係のインストール**
   ```bash
   # リポジトリルートで実行
   pnpm install
   ```

2. **環境変数の設定**
   ```bash
   # apps/backend/.env ファイルを作成
   cp .env.example .env
   ```

   以下の環境変数を設定：
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:55432/meshipiyo?schema=public"
   ```

3. **データベースの起動**
   ```bash
   # リポジトリルートで実行
   docker compose up -d db
   ```

4. **データベースの初期化（初回のみ）**
   
   **方法1: 統合コマンドを使用（推奨）**
   ```bash
   # リポジトリルートで実行
   # データベースリセット + 1ページ分のレストランデータ取得
   pnpm --filter backend db:init
   
   # またはすべてのレストランデータを取得する場合
   pnpm --filter backend db:init:all
   ```

   **方法2: 個別にコマンドを実行**
   ```bash
   # データベースリセットとシード実行
   pnpm --filter backend db:migrate:reset
   
   # レストランデータの取得
   cd apps/backend
   pnpm ageage:scrape
   ```

   ※ 統合コマンドは以下を一括で実行します：
   - 既存のデータベースを削除（存在する場合）
   - 新しいデータベースを作成
   - すべてのマイグレーションを実行
   - `prisma/seed.ts`の初期データを投入（ユーザーデータ、PGroonga拡張とインデックスの作成）
   - レストランデータのスクレイピングと保存

5. **開発サーバーの起動**
   ```bash
   # リポジトリルートで実行
   pnpm --filter backend dev

   # またはフロントエンドと同時に起動
   pnpm dev
   ```

   GraphQL Playgroundは http://localhost:44000 でアクセスできます。

### 2回目以降の起動

初回セットアップ完了後は、以下のコマンドだけで開発を開始できます：

```bash
# データベースの起動
docker compose up -d db

# 開発サーバーの起動
pnpm --filter backend dev
```

## 開発コマンド

```bash
# 開発サーバー起動
pnpm --filter backend dev

# コード生成（GraphQL + Prisma）
pnpm --filter backend codegen

# スクレイピング（レストランデータ取得）
# apps/backendディレクトリで実行
pnpm ageage:scrape         # 1ページ目のみ
pnpm ageage:scrape 10      # 1〜10ページ
pnpm ageage:scrape all     # 全ページ

# データベース操作
pnpm --filter backend db:migrate:dev     # 新しいマイグレーションを作成・実行
pnpm --filter backend db:migrate:deploy  # 本番環境へのマイグレーション
pnpm --filter backend db:studio          # Prisma Studio起動
pnpm --filter backend db:migrate:reset   # データベースリセット（注意：全データ削除）
pnpm --filter backend db:init            # DB初期化 + レストランデータ取得（1ページ）
pnpm --filter backend db:init:all        # DB初期化 + レストランデータ取得（全ページ）

# テスト・品質チェック
pnpm --filter backend test               # テスト実行
pnpm --filter backend lint               # リンター実行
pnpm --filter backend typecheck          # 型チェック
```

## プロジェクト構成

```
apps/backend/
├── prisma/
│   ├── schema.prisma          # データベーススキーマ定義
│   └── migrations/            # マイグレーションファイル
├── src/
│   ├── graphql/
│   │   ├── resolvers/         # GraphQLリゾルバー
│   │   └── typeDefs.ts        # GraphQLスキーマ定義
│   ├── services/              # ビジネスロジック
│   ├── utils/                 # ユーティリティ関数
│   └── server.ts              # サーバーエントリーポイント
└── codegen.yml                # GraphQL Code Generator設定
```

## 技術スタック

- **GraphQL Server**: GraphQL Yoga
- **ORM**: Prisma
- **Database**: PostgreSQL + PGroonga（日本語全文検索）
- **Type Generation**: GraphQL Code Generator + Prisma Client
- **Runtime**: Node.js

## 主な機能

- **GraphQLエンドポイント**: `/graphql`
- **カーソルベースのページネーション**: 効率的なデータ取得
- **全文検索**: PGroongaを使用した日本語検索
- **型安全性**: 自動生成される型定義

## トラブルシューティング

### データベース接続エラー
```bash
# Dockerコンテナが起動しているか確認
docker compose ps

# データベースログを確認
docker compose logs db
```

### マイグレーションエラー
```bash
# データベースをリセットして再マイグレーション
pnpm --filter backend db:migrate:reset
```

### 型エラー
```bash
# コード生成を再実行
pnpm --filter backend codegen
```

## 開発のヒント

1. **GraphQLスキーマを変更した場合**
   - `pnpm --filter backend codegen`を実行して型定義を更新

2. **データベーススキーマを変更した場合**
   - `pnpm --filter backend db:migrate:dev`で新しいマイグレーションを作成
   - `pnpm --filter backend codegen`を実行して型定義を更新

3. **GraphQL Playground**
   - http://localhost:44000 でクエリをテスト可能
   - ドキュメントエクスプローラーでスキーマを確認

4. **デバッグ**
   - `NODE_ENV=development`で詳細なエラーメッセージが表示される
   - Prisma Studioでデータベースの内容を直接確認可能