# デザイントークン洗い出し（作業1）

調査日: 2026-11-14（Asia/Tokyo）  
対象: `apps/frontend/app/**`, `apps/frontend/components/**`（`components/ui` の Radix 任意値は除外傾向）

## 結論

- 画面の雑誌風 UI は hex 直書きが本体。`globals.css` の shadcn 変数（白ベース oklch）はほぼ未使用だった
- フォント: layout は Noto（`--font-noto`）のみ読込。`@theme` は Geist を指しており実体なし → **Noto に一本化**
- `--radius: 0.625rem` と画面の `rounded-none` が矛盾 → **radius 0 に固定**
- `.dark` は未使用 → スタブ維持、提供しない

## 高頻度 hex（置換前）

| 値 | 件数 | 役割 |
| --- | --- | --- |
| `#302b26` | 29 | ink / 本文 / 塗りボタン |
| `#806a48` | 15 | リンク |
| `#777066` | 14 | 補助テキスト |
| `#d9d4ca` | 12 | 薄い枠・区切り |
| `#2f2b26` | 8 | 主枠線 |
| `#f5f2eb` | 5 | 紙背景 |
| `#d5a843` | 5 | ゴールドアクセント |
| `#fbfaf7` | 4 | カード面 |
| `#ded9d0` | 4 | 画像プレースホルダ |

その他 `#8a8278` / `#6f685f` / `#7a6c56` / `#24211e` / `#4a433c` / skeleton 系もトークン化した。

## レイアウト任意値

- `max-w-[1180px]` → `max-w-content`
- 写真 `aspect-[4/3]` は維持
- `shadow-nav` はヘッダーのみ例外として維持

## 作業3での対応

`globals.css` にブランドトークンを定義し、主要ページ・コンポーネントの hex をクラスへ置換。SVG ロゴ（`components/ui/icons.tsx`）の fill は例外として残置。
