---
title: "プログレスインジケーター 概要"
category: "components"
slug: "progress-indicator"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/progress-indicator/"
language: "ja"
---

# プログレスインジケーター （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：プログレスインジケーターの3つのパターンが横に並んでいる。左は淡い青のトラックに濃紺の弧を重ねたサークルタイプと「読み込み中」というテキスト。中央は淡い青のバーの左3割ほどを濃紺で塗ったリニアタイプと「読み込み中」というテキスト。右は濃紺の砂時計のアイコンと「生成中」というテキスト。](https://design.digital.go.jp/dads/images/components/progress-indicator/overview/progress_indicator_overview.png)

プログレスインジケーターは、ユーザーのアクションに対して処理進行中であることを通知します。データ取得リクエストの応答を待っていることをユーザーに伝えたいといった要求に対応します。

## ユースケース

- 画面全体が読み込み待ちのとき

  円形が回転するサークルタイプ、または横棒が動くリニアタイプを使います。読み込み中というラベルや、進捗状況をテキストで表示することができます。

- 画面の一部だけが処理中であるとき

  アニメーションしない砂時計タイプを使います。

## 注意が必要なケース

- 画面の一部だけが処理中の場合はサークルタイプやリニアタイプを使わない

  画面の一部分が動き続けて他の部分に注視できなくなる状況を避けるため、サークルタイプとリニアタイプは画面全体が処理中の場合にのみ使用してください。画面の一部だけが処理中の場合は、アニメーションしない砂時計タイプを使用してください。

- スケルトンUIの代わりにプログレスインジケーターを使う

  ロード待ちの画面で、レイアウトの骨格だけを先に見せる、いわゆるスケルトンUIは使用しないでください。複数のデータを待つ画面でも、処理中であることはプログレスインジケーターで示します。

- 手続き全体の進行状況を示す場合はステップナビゲーションを使う

  リニアタイプの見た目は手続き全体の進み具合を連想させますが、プログレスインジケーターは処理中の一時的な待機状態を示すためのコンポーネントです。申請手続きや登録フローなど、複数のステップからなる手続き全体の現在位置と流れを提示する場合は、ステップナビゲーションを使用してください。

## 関連コンポーネント

- [ステップナビゲーション](../step-navigation/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                               | 状態  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                                         | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/progress-indicator) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/docs/components-プログレスインジケーター--docs)                                  | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/v2/src/components/ProgressIndicator)   | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-progressindicator--docs)                     | 提供中 |
