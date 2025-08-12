// AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase'; // 先ほど修正したfirebase.tsからインポート

// Contextで共有する値の型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Contextを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 他のコンポーネントで user や loading を簡単に使えるようにするためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// アプリ全体をラップして、認証状態を提供するコンポーネント
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChangedは、ログイン、ログアウトなどユーザーの状態が変わるたびに呼び出される
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // コンポーネントが不要になったら監視を解除する
    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};