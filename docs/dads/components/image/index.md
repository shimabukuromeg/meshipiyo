---
title: "画像 概要"
category: "components"
slug: "image"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/image/"
language: "ja"
---

# 画像 （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：画像コンポーネントの例。丸と三角を組み合わせたグレーのダミー画像が配置され、その下に点線で囲まれた画像キャプションが4行にわたって配置されている。](https://design.digital.go.jp/dads/images/components/image/overview/image_overview.png)

HTMLの`<img>`に対応した、ページ中に画像を埋め込むためのコンポーネントです。画像キャプションと組み合わせて使うこともできます。

## ユースケース

- 写真・イラスト・図版（ダイアグラム）などでコンテンツを示すとき

  施設の外観写真、イベントの様子、製品の写真など、視覚的な情報として画像を提示する場合に使用します。また、グラフ、図表、フローチャート、地図など、本文の説明を視覚的に補完する画像を配置する場合にも使用します。

- 画像にキャプションを追加するとき

  画像とともに読むことができる補足説明を画像キャプションで提供できます。このとき、画像に関連したリンクを画像キャプション内に含めることもできます。

- 画像自体をリンクにするとき

  画像から直接、関連するページやコンテンツにリンクしたい場合に使用します。

## 注意が必要なケース

- 画像だけで重要な情報を伝えない

  重要な情報は必ず本文のテキストでも提供してください。画像が表示されない環境や、スクリーンリーダーを使用しているユーザーにも内容が伝わるようにします。

- 文字画像を使わない

  フォントを変更させないことを企図して、文字画像を使ってはなりません。ただし、ロゴタイプのように、文字画像であることが必要不可欠な場合を除きます。詳しくは[タイポグラフィ（アクセシビリティ）](../../foundations/typography/index.md)を参照してください。

## 各種リソース

| 種別       | リソース                                                                                                                                   | 状態  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                             | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/image)  | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-画像--docs)                                | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/Image) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-image--docs)                     | 提供中 |
