---
title: "説明リスト 概要"
category: "components"
slug: "description-list"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/description-list/"
language: "ja"
---

# 説明リスト （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：説明リストの2つのパターンが縦に並んでいる。上はマーカーなしで、下はビュレットのマーカーが付いている。どちらも、太字の項目名とその説明文のペアが2組連なっている。](https://design.digital.go.jp/dads/images/components/description-list/overview/description_list_overview.png)

「説明したいこと」と「その説明文」のペアを1つの項目として数え、それが複数連なるようなコンテンツの時に使用します。

## ユースケース

- 用語と説明をセットにして繰り返すとき

  用語集、FAQの質問と回答、仕様書の項目名と内容など、定義とその説明が対になる情報を列挙する場合に使用します。

- データを名前と値のペアで示すとき

  プロフィール情報、設定項目、申請内容の確認画面など、項目名とその値を対にして並べる場合に使用します。

## 注意が必要なケース

- データを比較する場合はテーブルを使う

  各項目の値を並べて比較したり、行と列で構造化したりする必要がある情報には、テーブルを使用してください。説明リストは、名前と値のペアが繰り返される情報に使用します。

- セクションの主題を示す場合は見出しを使う

  セクションの主題を示す必要がある場合は、説明リストのタイトルで見出しを表現するのではなく、見出しを使用してください。

- 用語と説明のペアでない場合は箇条書きリストを使う

  項目を列挙したり、項目の階層構造を示したりするだけの場合は、説明リストではなく箇条書きリストを使用してください。

- 複数の情報や操作を含む項目にはリソースリストを使う

  名前と説明などのペアだけでなく、複数の情報やリンク、選択などの操作を含む項目を一覧表示する場合は、リソースリストを使用してください。

## 関連コンポーネント

- [テーブル](../table/index.md)
- [見出し](../heading/index.md)
- [箇条書きリスト](../list/index.md)
- [リソースリスト](../resource-list/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                             | 状態   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| デザイン     | Figmaデザインデータ                                                                                                                                     | 提供予定 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/description-list) | 提供中  |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-説明リスト--docs)                                       | 提供中  |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/Dl)              | 提供中  |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-説明リスト--docs)                               | 提供中  |
