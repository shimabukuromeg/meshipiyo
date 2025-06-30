# Firebase AuthDomain設定ガイド

## 重要: authDomainの正しい設定

Firebase Authenticationの`authDomain`設定は、認証フローが正しく動作するために非常に重要です。

### 問題の背景

`authDomain`がアプリケーションのドメインと異なる場合、以下の問題が発生します：

1. **sessionStorageアクセスエラー**: "Unable to process request due to missing initial state"
2. **クロスドメイン制限**: ブラウザのセキュリティポリシーによりCookie/Storageアクセスが制限される

### 推奨設定

#### 開発環境
```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
```

#### 本番環境
```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-production-domain.com
```

### Firebase Consoleでの設定

1. Firebase Console → Authentication → Settings → Authorized domains
2. 以下のドメインを追加：
   - `localhost`（開発環境）
   - `your-production-domain.com`（本番環境）
   - `*.firebaseapp.com`（Firebase Hostingを使用する場合）

### 注意事項

1. **authDomainを変更した場合**、Firebase Consoleの「Authorized domains」に新しいドメインを追加する必要があります
2. **LINE Developers Console**のコールバックURLも更新が必要です：
   ```
   http://localhost/__/auth/handler（開発環境）
   https://your-production-domain.com/__/auth/handler（本番環境）
   ```

### 代替案：Firebase Hostingの使用

もし独自ドメインでの設定が困難な場合は、Firebase Hostingを使用することを推奨します：

1. Firebase Hostingでアプリをデプロイ
2. `authDomain`をデフォルトの`your-project-id.firebaseapp.com`のまま使用
3. アプリケーションも同じドメインでホストされるため、クロスドメイン問題が発生しない

### トラブルシューティング

環境変数が正しく設定されているか確認：
```bash
# .envファイルを確認
cat .env | grep FIREBASE_AUTH_DOMAIN
```

ブラウザコンソールで実際の設定を確認：
```javascript
console.log('Auth Domain:', firebase.auth().app.options.authDomain)
console.log('Current Domain:', window.location.hostname)
```