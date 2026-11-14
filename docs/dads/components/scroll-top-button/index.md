---
title: "スクロールトップボタン"
category: "components"
slug: "scroll-top-button"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/scroll-top-button/"
language: "ja"
---

# スクロールトップボタン

[2026年9月9日更新](changelog.md)

## \[エラー]このコンポーネントの使用は非推奨です（deprecated）

このコンポーネントはアクセシビリティまたはユーザビリティの観点等から、現在は使用が推奨されません。

やむを得ず使用する場合は、不利益があるユーザーの存在を踏まえたうえで注意深く使用してください。

## 本コンポーネントの非推奨理由

スクロールトップボタンは、現在は使用が推奨されていません。

固定配置されたボタンは常にコンテンツの一部を覆い隠し、特に拡大表示しているユーザーにとって閲覧の妨げになります。

また、ボタンをDOMの最下部に配置した場合、キーボード操作ではボタンにアクセスするために最下部までフォーカスを移動する必要があります。ページの途中で先頭に戻ろうとしても、キーボードユーザーはボタンにアクセスできません。

ブラウザの標準キーボード機能（Homeキーなど）でページの先頭への移動は実現できます。スクロールトップボタンは、アクセシビリティの問題がある一方で、利便性の向上が見込めないため、使用しないでください。

## 各種リソース

| 種別       | リソース                                                                                                                                                          | 状態       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| デザイン     | [Figmaデザインデータ（v1） \[新規タブで開きます\]](https://www.figma.com/community/file/1255349027535859598)                                                                    | 提供中（非推奨） |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/deprecated/ScrollToTopButton) | 提供中（非推奨） |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-deprecated-scrolltotopbutton--docs)                             | 提供中（非推奨） |
