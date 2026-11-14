# 飯ぴよ SEO監査（2026-11-14）

オーガニック検索の流入を増やすために、現行コードとデータ形状を調べた結果と、優先順位付きの改善計画です。

対象サイトは https://meshipiyo.app/ です。Search Consoleの直近3か月は、表示約25,900回・クリック215回・CTR 0.8%・平均順位13.4位です（オペレータ提供）。クエリ別・ページ別CSVは未受領です。受領後にパイロット店とエリア×ジャンル候補を再順位付けします。

## 結論

いまのボトルネックは「メタが無い」だけではなく、次の3点です。

1. 店舗詳細の価値が薄い。元記事には電話・営業時間・定休日・駐車場などがあるのに、コレクターが捨てている。さらにアゲアゲ以外の出典（Maps / 公式 / SNS）を載せる仕組みが無い。
2. クローラが辿れるURLが少ない。sitemap / robots が無く、トップは初期HTMLが先頭10件のみ、市区町村インデックスも無い。
3. エリア×ジャンルの検索意図に応えるページ次元（ジャンル）がデータに無い。

文章量を増やす施策より、確認済み事実の保存と発見導線の修復を先にします。未取得事実のAI生成はしません。

### 方針更新（2026-11-14）

中長期の本丸は次の2本です。

1. **マルチソース収集基盤**（アゲアゲ拡張 → Places / 公式 / SNS。すべて出典付き）
2. **詳細UIの再設計**（充実したフィールドを前提。既存の飯ぴよの見た目を崩さない）

ui-sdk などの新規デザインシステム依存は、このランでは入れない。

## 現状の仕組み

### 公開URL

| URL | 描画 | 備考 |
| --- | --- | --- |
| `/` | `force-dynamic` SSR | 初期10件。続きは server action の無限スクロール（ページURLなし） |
| `/?q=` | 同上 | 検索結果だが title / description / canonical はトップのまま |
| `/meshi/{id}` | オンデマンド。GraphQL `revalidate: 60` | 数値ID。スラッグなし |
| `/municipality/{id}` | 同上 | 所属店舗を全件SSR |

`apps/frontend/app/` に genre / filter ルートはありません。`robots.ts` と `sitemap.ts` は P0 で追加済みです。

### データ

`Meshi`（`apps/backend/prisma/schema.prisma`）が持つのは次だけです。

- `articleId`, `title`, `imageUrl`, `storeName`, `address`, `siteUrl`, `publishedDate`, `latitude`, `longitude`, `municipality`

`siteUrl` は店舗公式ではなく沖縄テレビ「アゲアゲ」記事URLです。ジャンル・営業時間・電話・価格・メニュー・公式サイト・駐車場のカラムはありません。同一店舗を束ねる店マスタもありません（記事1本＝1行）。

取り込みは `apps/backend/src/scripts/ageage-collector/` です。週次ジョブは一覧1ページ目だけです（`.github/workflows/exec-ageage-collector.yml`）。

### すでに良い実装

- 店舗・市区町村の `generateMetadata`（title / description / canonical / OG）
- 店舗の `Restaurant` + `BreadcrumbList` JSON-LD
- 見つからないIDの `robots: noindex` と `notFound()`
- `metadataBase` と title template `%s｜飯ぴよ`
- 市区町村ページが所属店舗を全件リンクしていること

### メタデータとインデックス制御

| 項目 | 現状 |
| --- | --- |
| ホーム title / description | ルート layout の既定のみ。やや弱いが存在はする |
| 店舗 title | `{店名}｜{市町村}の沖縄グルメ` |
| 店舗 description | 記事見出し `title` |
| 市区町村 | 件数入り description あり |
| robots.txt | なし |
| sitemap.xml | なし |
| `/?q=` | 固有メタなし。noindex も canonical 寄せもなし |
| `"unknown"` 既定値 | truthy のため OG画像や記事リンクが壊れ得る |
| GA4 / GSC verification | コード上なし。任意の GTM と Vercel Analytics / Speed Insights あり |

### 構造化データと内部リンク

- JSON-LD は店舗詳細のみ。`geo` / `telephone` / `openingHours` は未使用（緯度経度はDBにあるが詳細クエリが取っていない）
- 市区町村パンくずUIはあるが JSON-LD は無い
- 詳細から同エリア他店へのリストは無い（市区町村ページへのリンクのみ）
- ナビは Top のみ。市区町村一覧ページは無い

### 店舗詳細コンテンツ（追加調査）

2026-11-14にアゲアゲ記事109312のHTMLを取得し、店舗欄の`<dt>`に電話番号・営業時間・定休日・駐車場・カード・電子マネー・URL/SNSがあることを確認した。現行 scraper は店名と「住所」だけを取り、それ以外の`<dt>`を捨てている。本文・料理名・価格・追加画像も未保存です。

画面上の「営業時間・定休日…」注意文は固定文言で、データはありません。

| 候補 | スキーマ | 実データ | 詳細表示 | 次の一手 |
| --- | --- | --- | --- | --- |
| 店名・住所・見出し・画像・紹介日・記事URL | あり | あり（比率は要本番確認） | あり | UI整理・`"unknown"`ガード |
| 緯度経度 | あり | 失敗時 `0,0` | なし | クエリ追加。`0,0`除外で地図/JSON-LD |
| 同市区町村の他店 | 関係あり | FKがある店 | なし | 既存APIで関連店舗セクション |
| 電話・営業時間・定休日・駐車場・支払・公式/SNS | なし | 元記事にはある（サンプル） | なし | スキーマ＋scraper拡張 |
| ジャンル / テーマ | なし | 記事のテーマ名等は未保存 | なし | 収集設計が必要（エリア×ジャンルの前提） |
| 最終確認日時 | なし | `publishedDate` / 初回 `createdAt` のみ | 紹介日のみ | 再収集時に更新する確認日カラム |

## 優先順位付き課題

影響（流入）× 実装コスト × リスクで並べています。

### P0（すぐやる。可逆で発見・信頼に効く）

1. **sitemap.xml と robots.txt**  
   全 `/meshi/{id}` と `/municipality/{id}`、トップを列挙。`"unknown"` や欠落ページは除外。  
   狙い: 834件の発見を内部リンク依存から外す。  
   検証: `/sitemap.xml` の件数と本番URL一致。

2. **`/?q=` のインデックス制御**  
   `noindex` または canonical を `/` に寄せる。  
   狙い: 薄い重複URLを減らす。  
   検証: 検索結果HTMLの robots / canonical。

3. **`"unknown"` と `0,0` のガード**  
   画像・外部リンク・geo に出さない。店名などが `"unknown"` の行は sitemap 除外に加え `noindex` する（レコードはあるので現状はインデックス対象のまま）。  
   狙い: 壊れたOGと誤った構造化データを止める。  
   検証: 該当レコードのHTMLに不正URLが無く、robots が noindex であること。

4. **店舗メタの精度向上（既存フィールドのみ）**  
   description を店名＋地域＋紹介見出しの自然文に。ホームOGに title / description を明示。  
   狙い: CTR改善の土台。  
   検証: 代表ページの `<title>` / `meta description` / `og:*`。

5. **JSON-LD に確認済み geo を追加**  
   詳細クエリで lat/lng を取り、`0,0` 以外だけ `GeoCoordinates`。  
   狙い: 地図・ローカル意図の材料。推測フィールドは入れない。  
   検証: Rich Results Test相当のJSON検査。

6. **関連店舗（同市区町村）の内部リンク**  
   詳細に数件リンク。自店除外。  
   狙い: 回遊とクロール密度。  
   検証: 詳細HTMLに `/meshi/{他id}` があること。

6b. **カードの地図クエリを詳細と揃える**  
   `meshi-card.tsx` は店名のみ。詳細は店名＋住所。住所付きに揃える。  
   狙い: 誤った地図ヒットを減らす。  
   検証: カードの maps URL に住所が入ること。

### P1（店舗価値と検索意図。収集が絡む）

7. **コレクター拡張パイロット（10〜20店）**  
   元記事から電話・営業時間・定休日・駐車場・支払・公式/SNSをパースして保存。出典URLと取得日時を保持。無い欄は保存しない・表示しない。  
   狙い: 「行きたいか判断できる」ページにする。文章の言い換え量産はしない。  
   検証: パイロット店の画面に実データが出る。空セクションが無い。Search Consoleで該当URLの表示・CTRを前後比較（計測は公開後数週間）。

8. **最小スキーマ拡張**  
   上記フィールド＋`sourceVerifiedAt`（再取得時刻）。公式サイトと紹介記事URLを分離。  
   リスク: 著作権・利用規約。本文の大量転載はしない。構造化フィールドと短い確認済み要約に留める。

9. **市区町村インデックスページ**  
   `municipalities` クエリは既にある。一覧を公開しナビから辿れるようにする。  
   狙い: エリア導線の入口。

10. **ジャンル次元の設計（実装はデータが揃ってから）**  
    エリア×ジャンルはジャンル無しでは作れない。テーマ名や料理分類の収集方針を決めてから、十分な件数の組み合わせだけインデックスする。全組み合わせのプログラマティック生成はしない。

### P2（計測と体験）

11. GA4 / Search Console の計測手順の明文化（GTM有無の確認含む）
12. 画像最適化（`images.unoptimized: true` の見直し）と Core Web Vitals 実測
13. トップのクロール可能な「もっと見る」または市区町村経由の発見強化

## 店舗詳細の導入方針

### 既存データだけで先にやる

- 情報の並びをモバイル優先に整理（店名/写真/地域 → 短い紹介 → 基本情報 → 地図/出典 → 関連店舗）
- 出典（アゲアゲ記事）と紹介日を明示
- 関連店舗
- geo JSON-LD
- 空の「営業時間」欄は出さない（現状の固定注意文は、実データ導入後に差し替え）

### 収集が必要なもの（別タスクとして切る）

- scraper の datalist パース拡張（複数 `dd` の営業時間に注意）
- Prisma / GraphQL フィールド追加
- パイロット再収集ジョブ
- 表示コンポーネント（値があるときだけセクション表示）
- Restaurant JSON-LD への telephone / openingHours は、画面と同じ確認済み値だけ

### パイロット選定

Search Consoleのページ別表示回数と、元記事に構造化欄が揃っている店を交差させて 10〜20件。CSV未受領のため、実装時は那覇市など件数の多いエリアから記事を目視サンプリングする。

### 効果検証KPI

| 指標 | 見る場所 |
| --- | --- |
| 検索クリック / 表示 / CTR / 順位 | Search Console（全体・対象URL） |
| インデックス登録 | Search Console URL検査 / サイトマップ |
| 地図・紹介記事クリック | 未計測ならイベント設計が必要 |
| 月間PV / オーガニックセッション | GA4（導入確認後） |

## 実装単位（このランのワークフロー）

完了条件の述語:

1. 本監査がリポジトリにある
2. P0のうち sitemap/robots、`/?q=`制御、unknown/0,0ガード、geo JSON-LD、関連店舗、メタ精度がHTMLで確認できる
3. P1はアゲアゲ記事に既にある欄の収集拡張を先に実装する（Maps / ChatGPT は出典付きの次段）
4. 詳細UIは ui-sdk の振る舞い＋飯ぴよの既存ビジュアル。空欄は出さない
5. 低品質なエリア×ジャンル大量ページを作らない

### 自律実行時のデフォルト判断

- データ充足の第1段はアゲアゲ scraper 拡張。新規ソースは第2段
- LLMは未確認事実の捏造に使わない。抽出と出典付き整理のみ
- UIは `@ui-sdk/*` を使う。見た目は既存トークンを維持する
- Search Console CSVが無くてもコード上の優先順位で進める
- PRは narrow に分け、マージはオペレータが行う（force-push / 本番デプロイはしない）

単位の順序:

1. 監査ドキュメント（本ファイル）
2. robots + sitemap（`c13fb2c` 済み）
3. 検索URLのインデックス制御と unknown ガード、geo、関連店舗、メタ
4. ui-sdk 導入（依存と AGENTS / skill）
5. コレクター＋スキーマパイロット（電話・営業時間・定休日・駐車場など）
6. 詳細UI再設計（充実フィールド前提、空欄非表示）
7. 市区町村インデックス
8. （データ後）エリア×ジャンルの限定公開

各単位の後にビルド・型チェックと、対象URLのHTML確認を行います。

## 調査で読んだ主なファイル

- `apps/frontend/app/layout.tsx`, `page.tsx`, `meshi/[id]/page.tsx`, `municipality/[id]/page.tsx`
- `apps/frontend/components/restaurant-detail.tsx`, `meshi-card.tsx`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/scripts/ageage-collector/scraper.ts`
- `apps/backend/src/schema/meshi/schema.graphql`

## 残課題（オペレータ入力があると精度が上がる）

- Search Consoleのクエリ別・ページ別CSV
- 本番の `"unknown"` / `latitude = 0` / `municipality IS NULL` の件数
- GTMの中身（GA4接続の有無）
- アゲアゲ記事コンテンツの利用範囲（構造化項目の再掲が規約上どこまで許されるか）

## 変更・検証の記録欄

| 日付 | 変更 | SEOの狙い | 検証 |
| --- | --- | --- | --- |
| 2026-11-14 | 本監査作成 | 優先順位の固定 | コード調査に基づく |
| 2026-11-14 | how合成で監査を補強 | unknown の noindex、カード地図クエリを追記 | 合成は公開3ルート・薄いMeshi・sitemap欠如で監査と一致 |
| 2026-11-14 | アゲアゲ記事109312のHTML確認 | 電話・営業・定休・駐車等が元記事にあることを実測 | `/tmp`取得HTMLの`<dt>`列 |
| 2026-11-14 | P0実装（robots/sitemap、`/?q=` noindex、unknownガード、geo、関連店舗、メタ） | 発見と信頼の土台 | typecheck/lint green。HTML実測は未了（INCONCLUSIVE） |
| 2026-11-14 | クロスレビュー指摘の修正 | sitemapとnoindexの条件揃え、空市区町村のsitemap除外、地図/JSON-LDのunknown漏れ修正、ui-sdk記述削除 | typecheck再実行 |
| 2026-11-14 | `app/robots.ts` / `app/sitemap.ts` 追加 | 全店・全市区町村の発見 | ブランチ `cursor/seo-robots-sitemap-98af` / `c13fb2c`。モックGraphQLで検証済み。本番DB未接続 |
