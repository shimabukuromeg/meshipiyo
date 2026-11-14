---
title: "スイッチ 概要"
category: "components"
slug: "switch"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/switch/"
language: "ja"
---

# スイッチ （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：スイッチのパターンが縦に2つ並んでいる。上はオン・オフを切り替えるパターンで、淡い青のトラックの右側にチェックマークの入った青い丸があるオンの状態を示し、その右に「やさしい日本語に変換する」というラベルがある。下はモードを切り替えるパターンで、スイッチの左に「リスト表示」、右に「カレンダー表示」というラベルがあり、トラックの左側に青い丸があることでリスト表示が選ばれていることを示している。](https://design.digital.go.jp/dads/images/components/switch/overview/switch_overview.png)

スイッチは、切り替えたら即座に反映される設定項目のためのコントロールUIです。反映されたことがその場で目視により把握できる設定内容で使用できます。

## ユースケース

- オン・オフを切り替えるとき

  表示フィルターのオン・オフや、位置情報の利用許可など、切り替えた結果をその場で確認できる設定に使用します。

- 2つの選択肢のどちらかに切り替えるとき

  表示単位の切り替え（摂氏・華氏）や表示形式の切り替え（リスト表示・カレンダー表示）など、両方の選択肢にラベルを表示し、切り替えた結果をその場で確認できる場合に使用します。

## 注意が必要なケース

- その場で結果が分からない場合はチェックボックスやラジオボタンを使う

  スイッチを操作したその場で結果が分からないものには、スイッチを使わずチェックボックスやラジオボタンを使ってください。

- 選択後に確定操作が必要な場合はチェックボックスやラジオボタンを使う

  保存ボタンや送信ボタンなどの確定動作を要するものには、スイッチを使わずチェックボックスやラジオボタンを使ってください。

## 関連コンポーネント

- [チェックボックス](../checkbox/index.md)
- [ラジオボタン](../radio/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                    | 状態  |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                              | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/switch)  | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-スイッチ--docs)                               | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/Switch) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-switch--docs)                     | 提供中 |
