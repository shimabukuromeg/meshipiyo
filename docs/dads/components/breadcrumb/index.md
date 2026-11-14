---
title: "パンくずナビゲーション"
category: "components"
slug: "breadcrumb"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/breadcrumb/"
language: "ja"
---

# パンくずナビゲーション （ 概要 ）

[2026年10月21日更新](changelog.md)

![スクリーンショット：パンくずナビゲーション](https://design.digital.go.jp/dads/images/components/breadcrumb/overview/breadcrumb_overview.png)

パンくずナビゲーションは、ウェブサイトの階層内でユーザーの現在の位置を表示します。

## 各種リソース

| 種別       | リソース                                                                                                                                         | 状態  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                                   | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/breadcrumb)   | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-パンくずナビゲーション--docs)                             | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/Breadcrumbs) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-breadcrumbs--docs)                     | 提供中 |

# パンくずナビゲーション （ 使い方 ）

[2026年10月21日更新](changelog.md)

## 使い方

### 配置と仕様

パンくずナビゲーションはヘッダーとページ見出しの間に配置されます。パンくずナビゲーションの長さは、当該ページのサイト構造上の階層の深さや、ページ見出しの文字長に依存し制御できないため、コンテンツエリア幅より広くなることを考慮して、改行する仕様を前提とします。

モバイルの場合は、デスクトップと同様に改行する仕様を使うか、または改行無しの横スクロールが可能な仕様を併用するかのどちらかで実装します。

#### デスクトップ

![スクリーンショット：パンくずナビゲーションがコンテンツ幅よりも長い場合、リンクテキストの途中で改行されている。](https://design.digital.go.jp/dads/images/components/breadcrumb/overview/breadcrumb_desktop.png)

パンくずナビゲーションがコンテンツ幅よりも長い場合は改行されます。

#### モバイル

##### 改行での仕様　（ページ上部に配置）

![スクリーンショット：ページ上部に配置されているパンくずナビゲーション（改行あり）](https://design.digital.go.jp/dads/images/components/breadcrumb/overview/breadcrumb_mobile_1.png)

##### 改行での仕様　（ページ下部に配置）

![スクリーンショット：ページ下部に配置されているパンくずナビゲーション（改行あり）](https://design.digital.go.jp/dads/images/components/breadcrumb/overview/breadcrumb_mobile_2.png)

改行仕様の場合はページ上部、またはページ下部にパンくずナビゲーションを配置します。

##### 横スクロールでの仕様

![スクリーンショット：ページ上部および下部に配置されているパンくずナビゲーション。上部のパンくずナビゲーションは横スクロールで表示されるよう模式的に表現されている。下部のパンくずナビゲーションは改行されている。](https://design.digital.go.jp/dads/images/components/breadcrumb/overview/breadcrumb_mobile_3.png)

多くのページで長いパンくずナビゲーションが想定される場合、パンくずナビゲーションによってコンテンツを押し下げられることを防ぐため、改行無しの横スクロールによって閲覧できる仕様で実装します。ただし、横スクロールの仕様で実装した場合はページ下部、フッターエリアの上部に改行仕様のパンくずナビゲーションを配置するようにして下さい。
