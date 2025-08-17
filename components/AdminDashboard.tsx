
import React, { useState } from 'react';
import { Quiz } from '../types';
import { BackIcon, HeaderIcon, CopyIcon, CheckIcon, TrashIcon } from './Icons';
import { useAuth } from '../AuthContext';
// ▼▼▼ TanStack Tableに必要なフックや関数をインポート ▼▼▼
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

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
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
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

  // ▼▼▼ TanStack Tableで表示する列の定義 ▼▼▼
  const columns = React.useMemo<ColumnDef<Quiz>[]>(
    () => [
      {
        accessorFn: (row, index) => index + 1,
        header: 'No.',
        size: 60, // 初期サイズ（ピクセル）
      },
      {
        accessorKey: 'title',
        header: 'フォームのタイトル',
        size: 500,
      },
      {
        id: 'formUrl', // accessorKeyがない場合はidが必要
        header: 'フォームURL',
        cell: ({ row }) => (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <a href={`#/quiz/${row.original.id}`} target="_blank" rel="noopener noreferrer" className="text-tokium-green hover:underline font-semibold">
              クイズを開く
            </a>
            <button onClick={() => handleCopy(row.original.id)} className="text-gray-400 hover:text-tokium-green transition-colors">
              {copiedId === row.original.id ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: 'creator',
        header: '作成者',
        cell: ({ getValue, row }) => user && user.displayName === getValue() ? (
          <a href={`#/quiz/${row.original.id}?preview=true`} target="_blank" rel="noopener noreferrer" className="text-tokium-green hover:underline font-semibold">
            {getValue() as string}
          </a>
        ) : (
          <span>{getValue() as string}</span>
        ),
        size: 180,
      },
      {
        accessorKey: 'createdAt',
        header: '作成日時',
        cell: info => formatDateTime(info.getValue() as string),
        size: 200,
      },
      {
        id: 'delete',
        header: '削除',
        cell: ({ row }) => user && user.displayName === row.original.creator && (
          <div className="text-right">
            <button
              onClick={() => handleDelete(row.original.id, row.original.title)}
              className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md"
              title="このクイズを削除"
            >
              <TrashIcon />
            </button>
          </div>
        ),
        size: 80,
      },
    ],
    [quizzes, user, copiedId] // 依存配列を更新
  );
  
  // ソートされたデータを準備
  const sortedData = React.useMemo(
    () => [...quizzes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [quizzes]
  );

  // ▼▼▼ TanStack Tableのフックを呼び出し ▼▼▼
  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange', // 列のサイズ変更モード
  });

  return (
    <div className="min-h-screen bg-gray-bg text-text-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-6xl text-center mb-12">
        {/* ...ヘッダー部分は変更なし... */}
      </header>

      <main className="w-full max-w-6xl">
        <div className="flex justify-start mb-6">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }}
            className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            <BackIcon />
            作成画面に戻る
          </a>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {/* ▼▼▼ TanStack Tableの構造でテーブルを描画 ▼▼▼ */}
            <table 
              className="w-full text-left text-sm"
              style={{ width: table.getCenterTotalSize() }} // テーブル全体の幅を動的に設定
            >
              <thead className="bg-gray-50 border-b border-gray-200">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        scope="col" 
                        className="px-6 py-3 font-medium text-gray-600 relative"
                        style={{ width: header.getSize() }} // 各列の幅を動的に設定
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {/* 列の幅を変更するためのハンドル */}
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize select-none touch-none bg-tokium-green/20 opacity-0 hover:opacity-100"
                        />
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b border-gray-200 last:border-b-0 hover:bg-pale-blue-bg/40">
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id}
                          className="px-6 py-4 truncate"
                          style={{ width: cell.column.getSize() }} // 各セルの幅を動的に設定
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-16 text-gray-500">
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