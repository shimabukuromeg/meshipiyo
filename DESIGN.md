# 飯ぴよ DESIGN.md

専任デザイナーがいない前提で、見た目をぶらさないためのルール。
実装の正は `apps/frontend/app/globals.css` のトークン。この文書はその使い方と世界観を定める。

デジタル庁デザインシステム（`docs/dads/`）は **見た目の参照源にしない**。日本語の組み方・コントラスト・フォーム・キーボード・アクセシビリティだけ参照する。食い違いがあれば **この DESIGN.md を優先** する。

## 1. 世界観

- ことりっぷ / キナリノに近い、温かみと余白のある雑誌風
- 料理写真が主役。紙色の余白で呼吸させる
- 行政サイト、SaaS 管理画面、ダッシュボード、紫グラデの AI っぽい UI にはしない
- 角は立てる（角丸なし）。影は原則使わない（グローバルナビの `shadow-nav` のみ例外）
- ダークモードは提供しない

## 2. カラー

| トークン | 値 | 用途 | 禁止 |
| --- | --- | --- | --- |
| `background` / `paper` | `#f5f2eb` | ページ背景 | 本文テキストに使わない |
| `card` / `surface` | `#fbfaf7` | カード・パネル面 | |
| `nav` | `#ffffff` | グローバルヘッダーのみ | ページ背景に使わない |
| `foreground` / `ink` / `primary` | `#302b26` | 本文・見出し・塗りボタン | |
| `primary-foreground` | `#ffffff` | 塗りボタン上の文字 | |
| `ink-deep` | `#24211e` | 短いラベル帯など最暗面 | 広い面積に使わない |
| `ink-hover` | `#4a433c` | 塗りボタン hover | |
| `accent` / `gold` | `#d5a843` | 小さいアクセント（ラベル等） | 広い塗り・ボタン全面に使わない |
| `link` | `#806a48` | リンク・hover 文字 | |
| `muted-foreground` | `#777066` | 補助テキスト | |
| `muted-soft` | `#8a8278` | さらに弱い補助 | |
| `muted-warm` / `muted-olive` | `#6f685f` / `#7a6c56` | 既存画面の弱いラベル | 新規では `muted-foreground` を優先 |
| `border` | `#2f2b26` | 主枠線 1px | |
| `border-subtle` | `#d9d4ca` | 区切り・薄い枠 | |
| `border-soft` | `#bdb7ad` | 弱い枠 | |
| `border-hairline` | `#8f887d` | 入力下線など | |
| `muted` / `placeholder` | `#ded9d0` | 画像プレースホルダ | |
| `skeleton*` | `#e1dcd3` 系 | ローディング面 | |

クラス例: `bg-background`, `text-foreground`, `bg-primary`, `text-gold`, `border-border`, `border-border-subtle`, `text-link`.

## 3. タイポグラフィ

- 本文・UI は **Noto Sans JP**（`--font-noto`）。`font-sans` は Noto に向ける
- Geist は使わない（未配線のまま残さない）
- 見出しは `font-bold` + `tracking-tight` 系。雑誌風の短い見出しラベルは `tracking-[0.2em]` など既存パターンを踏襲
- 本文の行間は詳細で `leading-8` を基本にする
- 日本語本文は 1 行おおよそ 35〜40 字に収まる幅を目安にする（`max-w-content` 内で余白を取る）

## 4. 余白とレイアウト

- コンテンツ幅: `max-w-content`（1180px）
- 横パディング: `px-4 sm:px-6 lg:px-8`
- セクションは縦に積む。モバイルで横並びを無理に維持しない
- 1 セクションに目的は 1 つ（見出し + 短い説明 + 本体）

## 5. 形

- 角丸: `rounded-none`（`--radius: 0`）
- 枠線: 1px。主枠は `border-border`、区切りは `border-border-subtle`
- 影: 新規追加禁止。既存の `shadow-nav` 以外は増やさない
- グラデーション・グロー・大きなぼかしは追加しない

## 6. コンポーネントの型

### ヘッダー / ナビ
- `bg-nav` + `shadow-nav`
- ロゴは `BrandLogo`。新規アイコンセットを持ち込まない

### 店舗カード
- 写真は `aspect-[4/3]` で幅いっぱい
- タイトルは `text-foreground`、メタは `text-muted-foreground` / `text-link`
- カード枠で飾りすぎない。ホバーは色の変化程度

### 店舗詳細
- 紙背景の上に `bg-card` + `border-border` の記事面
- 情報は Tabs（基本情報 / アクセス / みんなの投稿 / 近くのお店）
- CTA 塗り: `bg-primary text-primary-foreground hover:bg-ink-hover`
- CTA 線: `border` + 透明背景

### パンくず
- 弱色リンク + 現在地は `text-foreground`

### ボタン
- 塗りと線の 2 種。角丸なし、高さは既存の `h-12` 系に合わせる

### タブ
- 下線インジケータ。選中は `border-foreground`、非選中は `text-muted-foreground`

### 地域一覧
- 1 行リスト + `border-border` + `bg-card`。装飾カードにしない

## 7. 写真

- 比率は 4:3、トリミングは中央寄りの `object-cover`
- `next/image` を使い、適切な `sizes` を付ける
- 出典（OTV おきティブ等）は既存の表記パターンを崩さない

## 8. 禁止事項

- hex / rgb / oklch のコンポーネント直書き（SVG ロゴ原稿のみ例外）
- トークンにない角丸・影・グラデーション・新色の追加
- 新色が必要なら、先にこの DESIGN.md と `globals.css` への追加案を出してから使う
- 新しい画面は、既存コンポーネントの組み合わせで足りないか先に検討する
- DADS のビジュアル（行政向けコンポーネント見た目）を飯ぴよに持ち込まない

## 9. AI 向け手順

1. UI を触る前にこのファイルと `globals.css` を読む
2. a11y / 日本語組みが必要なら `docs/dads/MANIFEST.md` から該当ページだけ読む
3. トークンだけで組む。足りなければ追加案を文書化してから実装する
