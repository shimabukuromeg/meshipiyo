---
title: "ページナビゲーション 概要"
category: "components"
slug: "page-navigation"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/page-navigation/"
language: "ja"
---

# ページナビゲーション （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：ページナビゲーションの4つのパターンが縦に並んでいる。1つ目は左向きの矢印を添えた「前のページ」のリンク、「13 / 24」というカウンター、右向きの矢印を添えた「次のページ」のリンクが横に並ぶ。2つ目は矢印だけを入れた円形のボタンで前後を示し、その間に「13 / 24」というカウンターが入る。3つ目は「前の3件」「次の3件」のリンクが並ぶ。4つ目は「申請情報の事前準備」「申請情報の確認」というラベルを持つアウトラインボタンが並ぶ。](https://design.digital.go.jp/dads/images/components/page-navigation/overview/page_navigation_overview.png)

ページナビゲーションは、複数に分割されたページやコンテンツを前後移動で表示できるようにするコンポーネントです。\
カルーセルやイメージスライダーのスライド切り替え、または連続するページのナビゲーションに使用します。

## ユースケース

- 一覧やテーブルを分割して前後に切り替えるとき

  同じ種類のコンテンツを表示件数で区切って一覧やテーブルに表示している場合に、前後の表示単位へ切り替えられるようにします。「1/24」「13ページ（全24ページ）」のように、全体に対する現在の位置を示すこともできます。

- 順番に並んだコンテンツを前後に移動するとき

  連続する記事など、順番に並んだコンテンツを読んでいる際に、順番的に前後になるコンテンツへ移動できるようにします。このとき、コンテンツ名をボタンラベルに含めることもできます。

## 注意が必要なケース

- 一連の手続きを示す場合はステップナビゲーションを使う

  複数のステップからなる手続き全体の現在位置と流れを提示する場合は、ページナビゲーションではなくステップナビゲーションを使用してください。

- 前後のページがない場合にボタンを無効化（disabled／非活性化）しない

  前のページまたは次のページが存在しない場合は、ボタンを無効化（disabled／非活性化）せず、ボタンを非表示にしてください。

## 関連コンポーネント

- [カルーセル](../carousel/index.md)
- [イメージスライダー](../image-slider/index.md)
- [テーブルコントロール](../table-control/index.md)
- [ステップナビゲーション](../step-navigation/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                            | 状態  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                                      | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/page-navigation) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-ページナビゲーション--docs)                                 | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/PageNavigation) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-pagenavigation--docs)                     | 提供中 |
