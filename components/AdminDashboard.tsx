// AdminDashboard.tsx

import React, { useState } from 'react';
import { Quiz } from '../types';
import { BackIcon, HeaderIcon, CopyIcon, CheckIcon, TrashIcon } from './Icons';
import { useAuth } from '../AuthContext';

interface AdminDashboardProps {
  quizzes: Quiz[];
  deleteQuiz: (quizId: string) => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ quizzes, deleteQuiz }) => {
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = (quizId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/quiz/${quizId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(quizId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('コピーに失敗しました。');
    });
  };
  
  const handleDelete = async (quizId: string, quizTitle: string) => {
    if (window.confirm(`本当に「${quizTitle}」を削除しますか？\nこの操作は元に戻せません。`)) {
      try {
        await deleteQuiz(quizId);
      } catch (error) {
        console.error("Failed to delete quiz: ", error);
        alert("クイズの削除に失敗しました。");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-bg text-text-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-6xl text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-2">
            <HeaderIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tokium-green to-light-green">
              管理メニュー
            </h1>
        </div>
        <p className="text-gray-600 text-lg">
          これまでに作成されたクイズの一覧です。
        </p>
      </header>

      <main className="w-full max-w-6xl">
        <div className="flex justify-start mb-6">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
            className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
            <BackIcon />
            作成画面に戻る
          </a>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* ▼▼▼ Changed table-fixed to table-auto for flexible widths ▼▼▼ */}
            <table className="w-full text-left text-sm table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* ▼▼▼ Adjusted width and whitespace classes ▼▼▼ */}
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 w-16">No.</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600">フォームのタイトル</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 whitespace-nowrap">フォームURL</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 whitespace-nowrap">作成者</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 whitespace-nowrap">作成日時</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 text-right w-16">削除</th>
                  {/* ▲▲▲ Adjusted width and whitespace classes ▲▲▲ */}
                </tr>
              </thead>
              <tbody>
                {quizzes.length > 0 ? (
                  [...quizzes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((quiz, index) => (
                    <tr key={quiz.id} className="border-b border-gray-200 last:border-b-0 hover:bg-pale-blue-bg/40">
                      <td className="px-6 py-4 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium truncate" title={quiz.title}>{quiz.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <a href={`#/quiz/${quiz.id}`} target="_blank" rel="noopener noreferrer" className="text-tokium-green hover:underline font-semibold">
                            クイズを開く
                          </a>
                          <button onClick={() => handleCopy(quiz.id)} className="text-gray-400 hover:text-tokium-green transition-colors">
                            {copiedId === quiz.id ? <CheckIcon /> : <CopyIcon />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 truncate">{quiz.creator}</td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{formatDateTime(quiz.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {user && user.displayName === quiz.creator && (
                          <button
                            onClick={() => handleDelete(quiz.id, quiz.title)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md"
                            title="このクイズを削除"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-500">
                      作成されたクイズはまだありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 TOKIUM INC.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;