'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { completeSignInFromEmailLink } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleEmailSignIn = async () => {
      try {
        const email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          setStatus('error');
          setErrorMessage('メールアドレスが見つかりません。再度ログインを試してください。');
          return;
        }

        await completeSignInFromEmailLink(email, window.location.href);
        setStatus('success');
        
        // 2秒後にホームページにリダイレクト
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : '認証に失敗しました。');
      }
    };

    handleEmailSignIn();
  }, [completeSignInFromEmailLink, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === 'loading' && '認証中...'}
            {status === 'success' && 'ログイン成功'}
            {status === 'error' && 'エラー'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>認証を処理中です...</span>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center space-y-2">
              <div className="text-green-600 text-lg">✓ ログインに成功しました</div>
              <p className="text-gray-600">ホームページにリダイレクトしています...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="text-red-600">{errorMessage}</div>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-blue-600 hover:underline"
              >
                ログインページに戻る
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}