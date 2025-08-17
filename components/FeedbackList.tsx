import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Feedback } from '../types';
import { BackIcon, HeaderIcon } from './Icons';

const FeedbackList: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(db, 'feedback');
        // orderByで新しい順に並び替え
        const q = query(feedbackCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Feedback));
        setFeedbackList(list);
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
        alert('データが取得できませんでした。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const formatTimestamp = (timestamp: { seconds: number }) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="min-h-screen bg-gray-bg text-text-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-1">
        <div className="flex items-center justify-center gap-4 mb-2">
            <HeaderIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tokium-green to-light-green">
              送信された内容一覧
            </h1>
        </div>
      </header>

      <main className="w-full max-w-4xl mt-4">
        <div className="flex justify-start mb-2">
          <a
            href="#/feedback"
            className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
            <BackIcon />
            報告フォームに戻る
          </a>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600">報告日時</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600">報告者</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600">種別</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600">報告内容</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-16 text-gray-500">読み込み中...</td></tr>
                ) : feedbackList.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-16 text-gray-500">まだ報告はありません。</td></tr>
                ) : (
                  feedbackList.map(item => (
                    <tr key={item.id} className="border-b border-gray-200 last:border-b-0 hover:bg-pale-blue-bg/40">
                      <td className="px-6 py-4 whitespace-nowrap">{formatTimestamp(item.createdAt)}</td>
                      <td className="px-6 py-4">{item.reporterName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.type === 'バグ' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-pre-wrap">{item.content}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackList;