# meshipiyo

沖縄のグルメ情報を探索するプラットフォームです。pnpmを使用したモノレポ構成で、バックエンドとフロントエンドの2つのアプリケーションから構成されています。

## プロジェクト構成

このリポジトリは以下で構成されています：

- `apps/backend`: GraphQL Yogaで構築されたバックエンドアプリケーション
- `apps/frontend`: Next.js 15で構築されたフロントエンドアプリケーション

各アプリケーションの詳細については、それぞれのディレクトリ内の`README.md`を参照してください。

## 開発環境のセットアップ

### 前提条件

1. ルートディレクトリで依存関係をインストール：

```bash
$ pnpm i
```

2. データベース（PostgreSQL）をセットアップ：

```bash
$ docker compose up -d db
$ pnpm --filter backend db:migrate:dev
```

### 開発環境の起動

**クイック開発スタート：**

```bash
# 全サービス + アプリケーション一括起動
$ make dev
```

**段階的起動：**

```bash
# ステップ1: Dockerサービス起動
$ make up

# ステップ2: アプリケーション起動
$ pnpm dev
```

**Docker開発のメリット：**
- ✅ オフライン開発
- ✅ 本番データへの影響なし
- ✅ 高速なテストサイクル
- ✅ 一貫したDocker環境

**アクセスURL：**
- フロントエンド: http://localhost:33000
- バックエンド: http://localhost:44000

### Dockerサービス管理（Makefile）

```bash
# 全コマンド確認
$ make help

# サービス管理
$ make up          # 全サービス起動
$ make down        # 全サービス停止
$ make restart     # 全サービス再起動
$ make status      # サービス状態確認
$ make logs        # ログ表示

# 個別サービス
$ make db          # DB単体起動

# クリーンアップ
$ make clean       # コンテナとボリューム削除
```

### アプリケーション管理（npm/pnpm）

```bash
# 開発用
$ pnpm dev         # フロントエンド + バックエンド起動

# 個別起動
$ pnpm --filter frontend dev  # フロントエンドのみ
$ pnpm --filter backend dev   # バックエンドのみ
```

### 環境変数

環境変数ファイルをコピーして設定：

```bash
# フロントエンド
$ cp apps/frontend/.env.local.example apps/frontend/.env.local

# バックエンド
$ cp apps/backend/.env.example apps/backend/.env
```

### ログ確認コマンド

```bash
# リアルタイムログ監視（全サービス）
$ make logs

# DB専用ログ
$ docker logs meshipiyo --tail 20  # 最新20行
$ docker logs meshipiyo -f         # リアルタイム監視
$ docker logs meshipiyo --since 5m # 5分以内のログ

# サービス状態確認
$ make status
```

### トラブルシューティング

- **DBに接続できない場合**: `make restart` でサービス再起動
- **マイグレーションに失敗する場合**: `pnpm --filter backend db:migrate:dev` を再実行

## コード品質管理

### 未使用コードの検出（knip）

[knip](https://knip.dev/) を使用して、未使用のファイル、依存関係、エクスポートを検出できます。

```bash
# 未使用コードをチェック（全ワークスペース）
$ pnpm knip

# 自動修正可能な項目を修正（package.jsonの未使用依存関係削除など）
$ pnpm knip:fix

# 特定のワークスペースのみチェック
$ pnpm knip --workspace apps/frontend
$ pnpm knip --workspace apps/backend
```

**検出される項目：**
- 未使用のファイル
- 未使用の依存関係（dependencies / devDependencies）
- 未使用のエクスポート（export）
- 未使用の型エクスポート（export type）

**設定ファイル：** `knip.json`

定期的に実行して、コードベースをクリーンに保つことを推奨します。
