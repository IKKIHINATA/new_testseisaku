// firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// あなたのWebアプリの正しいFirebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDzrafLrBFJwPmYWQRvUK_o4NRHZkdsNoU",
  authDomain: "testseisaku.firebaseapp.com",
  projectId: "testseisaku",
  storageBucket: "testseisaku.firebasestorage.app",
  messagingSenderId: "799657270458",
  appId: "1:799657270458:web:fabeed596f6452337c3683",
  measurementId: "G-DVBXFBFG5Q"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースのインスタンスを取得してエクスポート
export const db = getFirestore(app);