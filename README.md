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

**Docker Emulator使用のメリット：**
- ✅ JDK不要（環境汚染なし）
- ✅ メール認証の無制限テスト
- ✅ オフライン開発
- ✅ 本番データへの影響なし
- ✅ 高速なテストサイクル
- ✅ 一貫したDocker環境

**アクセスURL：**
- フロントエンド: http://localhost:33000
- バックエンド: http://localhost:44000
- Emulator管理UI: http://localhost:4000
- 認証Emulator: http://localhost:4000/auth

### Dockerサービス管理（Makefile）

```bash
# 全コマンド確認
$ make help

# サービス管理
$ make up          # 全サービス起動（DB + Firebase Emulator）
$ make down        # 全サービス停止
$ make restart     # 全サービス再起動
$ make status      # サービス状態確認
$ make logs        # ログ表示

# 個別サービス
$ make db          # DB単体起動
$ make emulator    # Firebase Emulator単体起動

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

**注意:** 開発モード（`NODE_ENV=development`）では、利用可能な場合自動的にFirebase Emulatorに接続します。

## Firebase Emulatorでの認証テスト

### マジックリンク認証の動作確認

1. **サービス起動**
   ```bash
   $ make up      # DB + Firebase Emulator起動
   $ pnpm dev     # アプリケーション起動
   ```

2. **認証テスト実行**
   - ブラウザで http://localhost:33000/auth/login にアクセス
   - テスト用メールアドレス（例：`test@example.com`）を入力
   - 「マジックリンクを送信」ボタンをクリック

3. **マジックリンク確認**
   ```bash
   # Firebase Emulatorのログでマジックリンクを確認
   $ docker logs firebase-emulator --tail 10
   ```
   
   ログに以下のような出力が表示されます：
   ```
   i  To sign in as test@example.com, follow this link: 
   http://127.0.0.1:9099/emulator/action?mode=signIn&lang=en&oobCode=...
   ```

4. **認証完了**
   - 表示されたリンクをブラウザで開く
   - 自動的にホームページにリダイレクトされる
   - http://localhost:4000/auth でユーザー作成を確認

### ログ確認コマンド

```bash
# リアルタイムログ監視（全サービス）
$ make logs

# Firebase Emulator専用ログ
$ docker logs firebase-emulator --tail 20  # 最新20行
$ docker logs firebase-emulator -f         # リアルタイム監視
$ docker logs firebase-emulator --since 5m # 5分以内のログ

# サービス状態確認
$ make status
```

### トラブルシューティング

- **Emulator UIにアクセスできない場合**: `make restart` でサービス再起動
- **マジックリンクが表示されない場合**: `docker logs firebase-emulator --tail 50` でログ確認
- **認証エラーの場合**: http://localhost:4000/auth で設定確認
