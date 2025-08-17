import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BackIcon, HeaderIcon } from './Icons'; // Iconsコンポーネントは既にあると仮定

const FeedbackForm: React.FC = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'機能要望' | 'バグ'>('機能要望');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('報告内容を入力してください。');
      return;
    }
    if (!user) {
      alert('ログインが必要です。');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        reporterName: user.displayName,
        reporterEmail: user.email,
        type: reportType,
        content: content,
        createdAt: serverTimestamp(),
        status: 'new', // 未対応・対応中などの管理用に
      });
      alert('ご報告ありがとうございます！\n貴重なご意見として参考にさせていただきます。');
      setContent('');
      setReportType('機能要望');
      window.location.hash = '#/admin'; // 送信後に管理メニューに戻る
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-bg text-text-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-2xl text-center mb-1">
        <div className="flex items-center justify-center gap-4 mb-2">
            <HeaderIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tokium-green to-light-green">
              機能要望・バグ報告
            </h1>
        </div>
        <p className="text-gray-600 text-lg">
          いつもご利用ありがとうございます。サービス改善のため、ご意見をお聞かせください。
        </p>
      </header>

      <main className="w-full max-w-2xl mt-4">
        {/* ▼▼▼ このブロックを書き換える ▼▼▼ */}
        <div className="flex justify-between items-center mb-2">
          <a
            href="#/admin"
            className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
            <BackIcon />
            管理メニューに戻る
          </a>
          <a 
            href="#/feedback/list"
            className="text-tokium-green hover:underline font-semibold transition-colors"
          >
            送信された内容はこちら
          </a>
        </div>
        {/* ▲▲▲ ここまで ▲▲▲ */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2" htmlFor="reporter">
              報告者
            </label>
            <input
              id="reporter"
              type="text"
              value={user?.displayName || '読み込み中...'}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2" htmlFor="reportType">
              種別
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as '機能要望' | 'バグ')}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tokium-green"
            >
              <option value="機能要望">機能要望</option>
              <option value="バグ">バグ</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2" htmlFor="content">
              報告内容
            </label>
            <textarea
              id="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="改善してほしい点や、発生した不具合などを具体的にご記入ください。"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tokium-green"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-tokium-green hover:brightness-95 text-white font-bold py-3 px-12 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default FeedbackForm;