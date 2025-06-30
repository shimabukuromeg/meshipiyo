# Next.js App Router 開発時のキャッシュ制御

## 1. serverComponentsHmrCache の無効化（実装済み）

`next.config.js` に以下の設定を追加しました：

```javascript
experimental: {
  serverComponentsHmrCache: false, // 開発時のHMRキャッシュを無効化
}
```

この設定により、開発時のホットモジュールリプレイスメント（HMR）でfetchレスポンスがキャッシュされなくなります。

## 2. 個別のfetchリクエストでキャッシュを無効化

### 方法1: cache: 'no-store' を使用

```typescript
// キャッシュを完全に無効化
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})
```

### 方法2: 開発環境でのみキャッシュを無効化

```typescript
const isDev = process.env.NODE_ENV === 'development'

const data = await fetch('https://api.example.com/data', {
  ...(isDev ? { cache: 'no-store' } : { next: { revalidate: 60 } })
})
```

### 実装例: app/api/meshi/route.ts の修正

現在のコード：
```typescript
fetch: cache(async (url: any, params: any) =>
  fetch(url, { ...params, next: { revalidate: 60, tags: ['meshi-data'] } }),
),
```

開発時にキャッシュを無効化するコード：
```typescript
const isDev = process.env.NODE_ENV === 'development'

fetch: cache(async (url: any, params: any) =>
  fetch(url, {
    ...params,
    ...(isDev 
      ? { cache: 'no-store' }
      : { next: { revalidate: 60, tags: ['meshi-data'] } }
    )
  }),
),
```

## 3. ルートセグメント全体での動的レンダリング強制

特定のページやレイアウトで常に最新のデータを取得したい場合：

### 方法1: dynamic = 'force-dynamic' を使用

```typescript
// app/page.tsx または app/layout.tsx の先頭に追加
export const dynamic = 'force-dynamic'
```

### 方法2: fetchCache = 'default-no-store' を使用

```typescript
// app/page.tsx または app/layout.tsx の先頭に追加
export const fetchCache = 'default-no-store'
```

これにより、そのセグメント内のすべてのfetchリクエストがデフォルトで `cache: 'no-store'` として扱われます。

## 4. GraphQL クライアントでの実装例

GraphQL クライアントを使用する場合の開発環境向け設定：

```typescript
import { GraphQLClient } from 'graphql-request'

const isDev = process.env.NODE_ENV === 'development'

export const graphqlClient = new GraphQLClient(endpoint, {
  fetch: async (url: any, params: any) => {
    const response = await fetch(url, {
      ...params,
      ...(isDev 
        ? { cache: 'no-store' }
        : { 
            next: { 
              revalidate: 60,
              tags: ['graphql-data']
            } 
          }
      )
    })
    return response
  }
})
```

## 推奨設定

開発環境では以下の組み合わせを推奨します：

1. `next.config.js` で `serverComponentsHmrCache: false` を設定（実装済み）
2. 環境変数を使用して条件付きでキャッシュを制御
3. 必要に応じて特定のルートで `dynamic = 'force-dynamic'` を使用

これにより、開発時は常に最新のデータを参照し、本番環境では適切なキャッシュ戦略を維持できます。