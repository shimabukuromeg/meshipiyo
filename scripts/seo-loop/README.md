# SEO self-improvement loop

Google Search Console の Search Analytics を使い、既存ページの **title / meta description だけ** を週次で最大3件改善し、14〜28日後に効果を測って残すか戻すかを判断します。新規記事の自動生成はしません。

## 仕組み

1. `evaluate` — 開始から14日以上経過した実験を評価（adopted / rollback / extend）
2. `fetch` — 直近28日と前28日の page×query（直近3日は未確定のため除外）
3. `select` — 表示100以上でCTRがサイト平均未満、または平均順位4〜15。進行中実験は除外。最大3件
4. `propose` — 上位クエリと現行メタから改善案（釣り禁止・重複禁止・title 30〜35文字目安）。過去の rollback 仮説は避ける
5. `apply` — `apps/frontend/seo/meta-overrides.json` と `seo-experiments.tsv` を更新する PR を作成（自動マージしない）

フロントは `generateMetadata` が overrides を優先読み込みします。本文・URL・内部リンクは変更しません。

## セットアップ（GCP サービスアカウント）

読み取り専用スコープ `https://www.googleapis.com/auth/webmasters.readonly` のみ使います。

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを開く（例: meshipiyo 用）
2. **APIs & Services → Library** で **Google Search Console API** を有効化
3. **IAM & Admin → Service Accounts** でサービスアカウントを作成
4. キーを JSON で発行し、内容を控える（リポジトリにコミットしない）
5. [Search Console](https://search.google.com/search-console) → 対象プロパティ（`sc-domain:meshipiyo.app`）→ **設定 → ユーザーと権限**
6. サービスアカウントのメール（`...@....iam.gserviceaccount.com`）を **オーナーまたは全権限** ではなく、**制限付きユーザー（閲覧）** で追加
7. GitHub リポジトリの Secrets に登録:
   - `GSC_SERVICE_ACCOUNT_JSON` … JSON キー全文
   - （任意）`GSC_SITE_URL` … 既定は `sc-domain:meshipiyo.app`

## ローカル実行

```bash
cd scripts/seo-loop
pnpm install
export GSC_SERVICE_ACCOUNT_FILE=/absolute/path/to/sa.json
# または
export GSC_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

pnpm fetch
pnpm select
pnpm propose
SEO_DRY_RUN=1 pnpm apply   # PR を作らず内容確認
pnpm evaluate
# 一括（週次と同じ順）
pnpm run-weekly
```

## GitHub Actions

`.github/workflows/seo-loop.yml` が毎週月曜 09:00 JST に `evaluate → fetch → select → propose → apply` を実行します。手動実行（`workflow_dispatch`）も可能です。

PR 作成には `contents: write` と `pull-requests: write` が必要です。候補が無い週は何もしません。
