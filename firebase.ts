// firebase.ts

// ↓↓↓ 互換モードのライブラリをインポート
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIza...", // あなたの実際のAPIキーに置き換えてください
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1ab2c3d4e5f67890"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firestoreデータベースのインスタンスを取得してエクスポート
export const db = firebase.firestore();