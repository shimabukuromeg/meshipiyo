---
title: "水平メニュー 概要"
category: "components"
slug: "horizontal-menu"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/horizontal-menu/"
language: "ja"
---

# 水平メニュー （ 概要 ）

[2026年10月14日更新](changelog.md)

## \[インフォメーション]名称変更について

グローバルメニューは名称変更して水平メニューになりました。

![スクリーンショット：水平メニューの例。左から「ホーム」「防災・救急」「くらし・手続き」「子育て・教育」「健康・医療・福祉」の5つの項目が並んでいる。「ホーム」の先頭には家のアイコンがついていて、青い文字で表示され、下部に青いボーダーが引かれている。「くらし・手続き」はグレーの背景が敷かれ、下部に黒いボーダーが引かれている。「ホーム」以外の4項目には、ラベルの後ろに下向きの矢印が添えられている。](https://design.digital.go.jp/dads/images/components/horizontal-menu/overview/horizontal_menu_overview.png)

水平メニューは、利用者を目的のページに誘導したり、コンテンツをわかりやすく表示するためのものです。ウェブサイトやアプリの中で一貫して表示し、回遊のための導線とします。

## ユースケース

- メニューを水平に並べるとき

  メニュー項目を横に並べることで、ユーザーが主要なナビゲーションを一目で把握できるようにします。縦方向に並べるときはメニューリストを使用します。

- サイトやアプリのカテゴリ・目的地へ誘導するとき

  トップページ、サービス一覧、お知らせなど、グローバルナビゲーションとしてサイトやアプリ内のカテゴリや目的地へのリンクを並べます。

- 関連する複数のリンクをまとめて提示するとき

  項目にサブメニューを持たせ、関連する複数のリンクをまとめて提示できるようにします。

## 注意が必要なケース

- 項目数が多すぎる場合は整理する

  水平メニューに多くの項目を並べると、ユーザーは目的のページを見つけにくくなります。項目を整理し、必要に応じて階層化を検討してください。

- モバイル画面での表示を考慮する

  画面幅が狭いデバイスでは、水平メニューの内容をハンバーガーメニューボタンとモバイルメニューで表示することを検討してください。

- ラベルには遷移先のページ名を使う

  項目のラベルには、遷移先のページ名を使用してください。「詳細」「その他」のような抽象的な表現は避けてください。

- 同じ主題のコンテンツを切り替える場合はタブを使う

  同じ主題のコンテンツを、概要・仕様・レビューなどの観点で切り替える場合は、水平メニューではなくタブを使用してください。

## 関連コンポーネント

- [ハンバーガーメニューボタン](../hamburger-menu-button/index.md)
- [モバイルメニュー](../mobile-menu/index.md)
- [メニューリスト](../menu-list/index.md)
- [タブ](../tab/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                            | 状態  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                                      | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/horizontal-menu) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-水平メニュー--docs)                                     | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/HorizontalMenu) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-horizontalmenu--docs)                     | 提供中 |
