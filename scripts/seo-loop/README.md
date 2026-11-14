# SEO self-improvement loop

Google Search Console の Search Analytics を使い、既存ページの **title / meta description だけ** を最大3件改善し、14〜28日後に効果を測って残すか戻すかを判断します。新規記事の自動生成はしません。

**運用の基本はローカル手動です。** 「チェックして」→ 候補を確認 →「PR作って」の流れを想定しています。GitHub Actions の定期実行はコストのため入れていません（手動 `workflow_dispatch` のみ）。

## 推奨フロー（ローカル）

```bash
cd scripts/seo-loop
pnpm install

# 1) データを取って候補と改善案を出す（PRは作らない）
pnpm check

# 2) data/proposals.json やターミナル出力を確認

# 3) 問題なければ PR 作成
pnpm apply
```

評価だけ先にやりたいとき:

```bash
pnpm evaluate          # 14日超の実験を判定。rollback なら戻し PR
# または確認のみ
SEO_DRY_RUN=1 pnpm evaluate
```

認証は次のどちらかです。

- **ローカル**: 既存の OAuth（`~/Library/Application Support/mcp-gsc/token.json`）で可
- **Actions / 共有**: サービスアカウント（下記）

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm check` | evaluate(dry) 相当はしない。fetch → select → propose して案を表示 |
| `pnpm apply` | 確認済みの案でブランチ + PR（自動マージしない） |
| `pnpm evaluate` | 進行中実験の採用 / 戻し / 延長 |
| `pnpm fetch` / `select` / `propose` | 各ステップ単体 |

`SEO_DRY_RUN=1` を付けると git push / PR 作成をスキップします。

候補が無いときは何もしません。オープン中 PR が `meta-overrides.json` や `seo-experiments.tsv` を触っているときは `apply` をスキップします。

## 仕組み（内部）

1. `fetch` — 直近28日と前28日の page×query（直近3日は未確定のため除外）
2. `select` — 表示100以上でCTRがサイト平均未満、または平均順位4〜15。進行中実験は除外。最大3件
3. `propose` — 上位クエリと現行メタから改善案（釣り禁止・重複禁止・title 30〜35文字目安）
4. `apply` — `apps/frontend/seo/meta-overrides.json` と `seo-experiments.tsv` の PR
5. `evaluate` — 開始14日超を比較し adopted / rollback / extend

フロントは `generateMetadata` が overrides を優先読み込みします。本文・URL・内部リンクは変更しません。

## セットアップ（GCP サービスアカウント）

Actions や共有実行向け。読み取り専用スコープ `webmasters.readonly` のみ使います。

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを開く
2. **APIs & Services → Library** で **Google Search Console API** を有効化
3. **IAM & Admin → Service Accounts** でサービスアカウントを作成
4. キーを JSON で発行（リポジトリにコミットしない）
5. [Search Console](https://search.google.com/search-console) → `sc-domain:meshipiyo.app` → **設定 → ユーザーと権限**
6. SA メールを **制限付きユーザー（閲覧）** で追加
7. GitHub Secrets:
   - `GSC_SERVICE_ACCOUNT_JSON` … JSON キー全文
   - （任意）`GSC_SITE_URL` … 既定 `sc-domain:meshipiyo.app`

ローカルで SA を使う場合:

```bash
export GSC_SERVICE_ACCOUNT_FILE=/absolute/path/to/sa.json
```

## GitHub Actions（手動のみ）

`.github/workflows/seo-loop.yml` は `workflow_dispatch` のみです。Actions タブから必要なときだけ実行できます。
