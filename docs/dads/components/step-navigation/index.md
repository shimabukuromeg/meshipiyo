---
title: "ステップナビゲーション 概要"
category: "components"
slug: "step-navigation"
document_type: "reference"
source_url: "https://design.digital.go.jp/dads/components/step-navigation/"
language: "ja"
---

# ステップナビゲーション （ 概要 ）

[2026年9月9日更新](changelog.md)

![スクリーンショット：ステップナビゲーションの2つのパターンが縦に並んでいる。上は5つのステップを横に並べ、下は同じ内容を縦に並べている。ステップは順に「①基本情報入力」「②利用規約の確認」「③本人確認」「④顔写真の登録」「⑤申請情報の入力」で、①から③にはグレーの丸にチェックマークが付き、④は黒く塗られて二重丸になっており、⑤は白い丸で示されている。](https://design.digital.go.jp/dads/images/components/step-navigation/overview/step_navigation_overview.png)

一連の手続きを論理的なステップで提示して、完了までに必要な作業を俯瞰したり、進行状況を把握したりできるようにするコンポーネントです。ナビゲーションとして使用する場合もあります。

## ユースケース

- 一連の手続きの流れを示すとき

  完了までに必要な作業を論理的なステップに分けて提示し、利用者が手続き全体の流れを把握できるようにします。申請や登録などが、複数の画面に分かれている場合に使用します。

- 手続きの現在位置や状態を示すとき

  現在どのステップにいるかや、完了、スキップ、エラーなどの状態を示し、利用者が完了までに必要な作業を把握できるようにします。

## 注意が必要なケース

- 一時的な処理の待機状態にはプログレスインジケーターを使う

  データの読み込みや処理の完了を待つ場合など、手続き全体ではなく一時的な処理中の状態を示す場合は、プログレスインジケーターを使用してください。

- ページやコンテンツの前後移動にはページナビゲーションを使う

  順番に並んだページやコンテンツを前後に移動する場合は、ページナビゲーションを使用してください。

## 関連コンポーネント

- [プログレスインジケーター](../progress-indicator/index.md)
- [ページナビゲーション](../page-navigation/index.md)

## 各種リソース

| 種別       | リソース                                                                                                                                            | 状態  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| デザイン     | [Figmaデザインデータ（v2） \[新規タブで開きます\]](https://www.figma.com/community/file/1377880368787735577)                                                      | 提供中 |
| HTML版実装  | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-html/tree/main/src/components/step-navigation) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/html/?path=/story/components-ステップナビゲーション--playground-single)                  | 提供中 |
| React版実装 | [ソースコード（GitHub） \[新規タブで開きます\]](https://github.com/digital-go-jp/design-system-example-components-react/tree/main/src/components/StepNavigation) | 提供中 |
|          | [サンプル（Storybook） \[新規タブで開きます\]](https://design.digital.go.jp/dads/react/?path=/docs/component-dads-v2-stepnavigation--docs)                     | 提供中 |
