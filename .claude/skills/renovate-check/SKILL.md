---
name: renovate-check
description: Renovate が作成した GitHub PR の依存関係更新内容を詳細にチェックする。Renovate PR の URL が渡された時、または依存関係更新の PR をレビューする時に使用する。
allowed-tools: Bash, Read, Grep, Glob, WebFetch, WebSearch, Task
---

# Renovate PR チェッカー

Renovate が作成した依存関係更新 PR を包括的に分析し、日本語でレポートを作成します。

## 実行手順

### 1. PR 情報の取得

GitHub PR URL から以下のコマンドで情報を取得:

```bash
gh pr view <PR_URL> --json title,body,files,headRefName,baseRefName,additions,deletions
```

PR タイトルからパッケージ名とバージョン変更を抽出する。

### 2. バージョン変更の種類を判定

セマンティックバージョニングに基づいて判定:

- **Major**: メジャーバージョンアップ（例: v1.x.x → v2.x.x）- 破壊的変更の可能性が高い
- **Minor**: マイナーバージョンアップ（例: v1.1.x → v1.2.x）- 新機能追加、後方互換性あり
- **Patch**: パッチバージョンアップ（例: v1.1.1 → v1.1.2）- バグ修正、後方互換性あり

### 3. 変更内容の調査

WebFetch または WebSearch を使用して:

- パッケージの GitHub リリースページ（`https://github.com/<owner>/<repo>/releases`）を確認
- CHANGELOG.md を確認
- 変更内容を日本語で要約
- 主要な新機能、バグ修正、改善点をリストアップ

### 4. Breaking Changes の確認

リリースノートから以下を探す:

- 「Breaking Changes」「BREAKING」セクション
- マイグレーションガイドの有無
- 非推奨（deprecated）になった API
- 削除された機能

### 5. 本リポジトリでの利用箇所の特定

Grep ツールを使用して検索:

```bash
# ESM import
rg "from ['\"]<package-name>" --type ts --type tsx --type js --type jsx

# CommonJS require
rg "require\(['\"]<package-name>" --type ts --type js

# 設定ファイルでの参照
rg "<package-name>" -g "*.config.*" -g "*.json"
```

影響を受けるファイル一覧と利用方法を出力する。

### 6. ビルド/実行環境要件の変更確認

以下を確認:

- Node.js の最小バージョン要件の変更（package.json の engines フィールド）
- pnpm/npm/yarn のバージョン要件
- peerDependencies の変更
- その他のランタイム依存関係の変更

### 7. 周辺ツール設定との互換性確認

本リポジトリで使用しているツールとの互換性をチェック:

- **TypeScript**: `tsconfig.json` の設定、型定義の変更
- **Biome**: `biome.json` での設定との互換性
- **Vitest/Jest**: テスト設定との互換性
- **Webpack/Turbopack/Vite**: バンドラー設定との互換性
- **Next.js**: next.config.js との互換性
- **Prisma**: schema.prisma との互換性（該当する場合）

## 出力フォーマット

以下の形式で日本語レポートを出力:

```markdown
# Renovate PR チェックレポート

## 基本情報

| 項目 | 内容 |
|------|------|
| パッケージ名 | `<package-name>` |
| バージョン変更 | `<old-version>` → `<new-version>` |
| 変更種別 | **Major** / **Minor** / **Patch** |
| PR URL | <url> |

## 変更内容サマリー

<日本語で変更内容を要約（3-5文程度）>

### 主な変更点

- <変更点1>
- <変更点2>
- <変更点3>

## Breaking Changes

<Breaking Changes の有無>

### 詳細（該当する場合）

- <breaking change 1>
- <breaking change 2>

### 必要な対応

<マイグレーション手順や対応方法>

## 本リポジトリでの利用箇所

| ファイル | 利用方法 |
|---------|---------|
| `<file1>` | <usage1> |
| `<file2>` | <usage2> |

**影響範囲**: <影響の大きさを評価>

## 環境要件の変更

| 項目 | 変更前 | 変更後 | 対応必要 |
|------|--------|--------|----------|
| Node.js | <old> | <new> | Yes/No |
| peerDependencies | <old> | <new> | Yes/No |

## ツール互換性

| ツール | 互換性 | 備考 |
|--------|--------|------|
| TypeScript | OK/要確認/NG | <詳細> |
| Biome | OK/要確認/NG | <詳細> |
| Next.js | OK/要確認/NG | <詳細> |

## リスク評価

- [ ] **低リスク**: そのままマージ可能
- [ ] **中リスク**: ローカルでの動作確認推奨
- [ ] **高リスク**: 詳細なテストと移行作業が必要

### 推奨アクション

1. <アクション1>
2. <アクション2>
3. <アクション3>

## 参考リンク

- [リリースノート](<url>)
- [CHANGELOG](<url>)
- [マイグレーションガイド](<url>)（該当する場合）
```

## 注意事項

- メジャーバージョンアップの場合は特に慎重に Breaking Changes を確認
- 利用箇所が多いパッケージは影響範囲を詳細に分析
- 不明点がある場合は公式ドキュメントや GitHub Issues を参照
- TypeScript の型定義（@types/*）パッケージの場合は、対応する本体パッケージとの互換性も確認
