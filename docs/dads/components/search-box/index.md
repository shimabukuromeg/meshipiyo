---
title: "検索ボックス 概要"
category: "components"
slug: "search-box"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/search-box/"
language: "ja"
---

# 検索ボックス （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：検索ボックスの例。「サイト内検索」という見出しの下に、検索ボックスのインプットテキストがある。インプットテキストは左側に「検索対象 すべて」と書かれたセレクトボックス、右側に虫眼鏡アイコンと「マイナンバーカード」と入力されたテキストフィールドからなる。インプットテキストの右に「検索」というラベルの塗りボタン。インプットテキストの下に、「詳細検索」というタイトルのディスクロージャーがあり、その右に「検索条件：現行法令 , 法令 , 勅令 , 関連度順, 10件」と書かれたテキストが並ぶ。最下部には「よくある検索：」というテキストに続き、「マイナンバーカード 申請」「マイナンバーカード iPhone」「マイナンバーカード コンビニ」「マイナンバーカード 健康保険証」というキーワードのボタンが並び、改行され2行目に「マイナンバーカード 運転免許証」というキーワードのボタンがある。](https://design.digital.go.jp/dads/images/components/search-box/overview/search_box_overview.png)

サイト内検索等で使用するコンポーネントです。詳細検索パネルや固定のキーワードで検索できるショートカットパーツを備えています。

## ユースケース

- サイト内のコンテンツを検索するとき

  サイト全体を対象に、コンテンツを検索できるようにしたい場合に使用します。

- 絞り込み検索を提供するとき

  検索対象をメニューから選択して、検索範囲を絞り込めるようにしたい場合に使用します。

- よく検索されるキーワードへの入り口を用意するとき

  よく検索されるキーワードに、入力の手間なくすぐアクセスできるようにしたい場合に使用します。

## 注意が必要なケース

- データテーブルの絞り込みにはテーブルコントロールを使う

  テーブル内の行や列を絞り込む場合は、テーブルコントロールの使用も検討してください。

## 関連コンポーネント

- [テーブルコントロール](../table-control/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                       | 状態  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                                 | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/search-box) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-検索ボックス--docs)                                | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/SearchBox) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-searchbox--docs)                     | 提供中 |
