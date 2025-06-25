# Firebase ConsoleでのLINE認証設定ガイド

このドキュメントでは、FirebaseでLINEログインを有効にするための設定手順を説明します。

## エラーの原因

表示されているエラー「ACCESS_DENIED」は、以下の原因で発生している可能性があります：

1. Firebase ConsoleでLINEプロバイダーが正しく設定されていない
2. LINE Developersコンソールの設定とFirebaseの設定が一致していない
3. ユーザーがLINE認証を拒否した

## 設定手順

### 1. LINE Developersコンソールでの設定

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. 新しいチャネルを作成または既存のチャネルを選択
   - チャネルタイプ: 「LINE Login」を選択
3. 以下の情報を取得：
   - **Channel ID**
   - **Channel Secret**

### 2. Firebase Consoleでの設定

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 左メニューから「Authentication」→「Sign-in method」を選択
4. 「追加プロバイダー」をクリックし、「LINE」を選択
5. 以下の情報を入力：
   - **LINE チャンネル ID**: LINE Developersコンソールから取得したChannel ID
   - **LINE チャンネル シークレット**: LINE Developersコンソールから取得したChannel Secret
6. 「有効にする」をトグルをONにする
7. 表示される「コールバックURL」をコピー（次のステップで使用）

### 3. LINE DevelopersコンソールでコールバックURLを設定

1. LINE Developersコンソールに戻る
2. 「LINE Login設定」タブを開く
3. 「コールバックURL」にFirebase Consoleからコピーした**コールバックURL**を追加
   - 例: `https://your-project-id.firebaseapp.com/__/auth/handler`

### 4. 必要な権限の確認

LINE Developersコンソールで以下の権限が有効になっていることを確認：
- `openid`
- `profile`
- `email`（必要に応じて）

## トラブルシューティング

### よくある問題と解決方法

1. **「auth/invalid-credential」エラー**
   - Channel IDとChannel Secretが正しく入力されているか確認
   - Firebase ConsoleでLINEプロバイダーが有効になっているか確認

2. **「ACCESS_DENIED」エラー**
   - ユーザーが認証を拒否した場合に発生
   - LINE DevelopersコンソールでコールバックURLが正しく設定されているか確認

3. **ポップアップがブロックされる**
   - ブラウザのポップアップブロック設定を確認
   - ボタンクリックなどのユーザーアクションから直接`signInWithLine`を呼び出しているか確認

## 開発環境での注意事項

開発環境でFirebase Auth Emulatorを使用している場合：
- Emulatorは外部プロバイダー（LINE含む）をサポートしていません
- 本番のFirebaseプロジェクトを使用してテストする必要があります

## コードの実装確認

AuthContext.tsx内の実装が以下のようになっていることを確認：

```typescript
const provider = new OAuthProvider('oidc.line')
provider.addScope('profile')
provider.addScope('openid')
await signInWithPopup(auth, provider)
```

## 参考リンク

- [Firebase Authentication - LINE ログイン](https://firebase.google.com/docs/auth/web/line)
- [LINE Developers Documentation](https://developers.line.biz/ja/docs/line-login/)