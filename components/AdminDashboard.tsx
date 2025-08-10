import React from 'react';
import { Quiz } from '../types';
import { BackIcon, HeaderIcon } from './Icons';

interface AdminDashboardProps {
  quizzes: Quiz[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ quizzes }) => {

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
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 tracking-wider">No.</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 tracking-wider">フォームのタイトル</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 tracking-wider">フォームURL</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 tracking-wider">作成者</th>
                  <th scope="col" className="px-6 py-3 font-medium text-gray-600 tracking-wider">作成日時</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.length > 0 ? (
                  [...quizzes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((quiz, index) => (
                    <tr key={quiz.id} className="border-b border-gray-200 last:border-b-0 hover:bg-pale-blue-bg/40">
                      <td className="px-6 py-4 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{quiz.title}</td>
                      <td className="px-6 py-4">
                        <a 
                          href={`#/quiz/${quiz.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokium-green hover:underline font-semibold"
                        >
                          クイズを開く
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{quiz.creator}</td>
                      <td className="px-6 py-4 text-gray-700">{formatDateTime(quiz.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-500">
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