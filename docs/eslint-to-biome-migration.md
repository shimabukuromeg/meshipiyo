# ESLint から Biome への移行

フロントエンドの lint ツールを ESLint から Biome に移行した記録。

## 移行した理由

- ESLint 9.x で Flat Config が必須になり、既存の `.eslintrc.json` が動作しなくなった
- Biome v2 で Next.js が first-class domain としてサポートされた
- `next/core-web-vitals` 相当のルールが Biome でカバーされるようになった

## 変更内容

### 削除したファイル・依存関係

- `apps/frontend/.eslintrc.json`
- `eslint` (9.36.0)
- `eslint-config-next` (16.0.8)
- `@eslint/eslintrc` (3.3.1)

201 パッケージが削減された。

### 追加した設定

`apps/frontend/biome.json`:

```json
{
  "extends": ["../../biome.json"],
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    }
  },
  "linter": {
    "domains": {
      "next": "all"
    }
  }
}
```

### 変更したスクリプト

```diff
- "lint": "eslint ."
+ "lint": "biome lint ."
```

## Biome の Next.js ドメインでカバーされるルール

| Biome ルール                              | ESLint 相当                                        |
| ----------------------------------------- | -------------------------------------------------- |
| `noImgElement`                            | `@next/next/no-img-element`                        |
| `noHeadElement`                           | `@next/next/no-head-element`                       |
| `noDocumentImportInPage`                  | `@next/next/no-document-import-in-page`            |
| `noHeadImportInDocument`                  | `@next/next/no-head-import-in-document`            |
| `noUnwantedPolyfillio`                    | `@next/next/no-unwanted-polyfillio`                |
| `useGoogleFontPreconnect`                 | `@next/next/google-font-preconnect`                |
| `noSyncScripts` (nursery)                 | `@next/next/no-sync-scripts`                       |
| `noBeforeInteractiveScriptOutsideDocument` (nursery) | `@next/next/no-before-interactive-script-outside-document` |
| `noNextAsyncClientComponent` (nursery)    | `@next/next/no-async-client-component`             |
| `useExhaustiveDependencies`               | `react-hooks/exhaustive-deps`                      |
| `useHookAtTopLevel`                       | `react-hooks/rules-of-hooks`                       |

## `next/core-web-vitals` の全ルール（参考）

ESLint の `next/core-web-vitals` に含まれていた `@next/eslint-plugin-next` の全ルール:

| ルール                                    | 説明                                               |
| ----------------------------------------- | -------------------------------------------------- |
| `google-font-display`                     | Google Fonts で `font-display` を強制              |
| `google-font-preconnect`                  | Google Fonts に `preconnect` を強制                |
| `inline-script-id`                        | インラインスクリプトに `id` 属性を強制             |
| `next-script-for-ga`                      | Google Analytics に `next/script` を推奨           |
| `no-assign-module-variable`               | `module` 変数への代入を禁止                        |
| `no-async-client-component`               | Client Component の async 関数を禁止               |
| `no-before-interactive-script-outside-document` | `beforeInteractive` を `_document.js` 外で禁止 |
| `no-css-tags`                             | 手動の `<link rel="stylesheet">` を禁止            |
| `no-document-import-in-page`              | ページでの `next/document` インポートを禁止        |
| `no-duplicate-head`                       | `_document.js` での `<Head>` 重複を禁止            |
| `no-head-element`                         | `<head>` 要素の使用を禁止                          |
| `no-head-import-in-document`              | `_document.js` での `next/head` を禁止             |
| `no-html-link-for-pages`                  | 内部リンクでの `<a>` を禁止（`next/link` 推奨）    |
| `no-img-element`                          | `<img>` を禁止（`next/image` 推奨、LCP 改善）      |
| `no-page-custom-font`                     | ページ単位のカスタムフォントを禁止                 |
| `no-script-component-in-head`             | `next/head` 内での `next/script` を禁止            |
| `no-styled-jsx-in-document`               | `_document.js` での `styled-jsx` を禁止            |
| `no-sync-scripts`                         | 同期スクリプトを禁止                               |
| `no-title-in-document-head`               | `_document.js` の `Head` 内での `<title>` を禁止   |
| `no-typos`                                | Next.js データフェッチ関数のタイポを検出           |
| `no-unwanted-polyfillio`                  | Polyfill.io の重複ポリフィルを禁止                 |

## 参考リンク

- [Biome Linter Domains - Next.js](https://biomejs.dev/linter/domains/#next)
- [Next.js GitHub Discussion - Biome サポート](https://github.com/vercel/next.js/discussions/59347)
- [Next.js 15.5 Biome Migration Guide](https://www.tsepakme.com/blog/nextjs-biome-migration)
- [Biome - ESLint/Prettier からの移行ガイド](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [Next.js ESLint Configuration](https://nextjs.org/docs/app/api-reference/config/eslint)
- [GitHub Discussion: eslint-config-next の違い](https://github.com/vercel/next.js/discussions/58714)

## 関連 PR

- [#187 refactor(frontend): ESLint を Biome に置き換え](https://github.com/shimabukuromeg/meshipiyo/pull/187)
