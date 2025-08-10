import React, { useState, useCallback } from 'react';
import { AppStatus, QuizItem } from '../types';
import FileUpload from './FileUpload';
import GeneratedContent from './GeneratedContent';
import Loader from './Loader';
import { extractTextFromPdf } from '../services/pdf';
import { generateQuizFromText } from '../services/gemini';
import { generateGoogleAppsScript } from '../services/googleAppsScript';
import { HeaderIcon, PlayIcon, FileIcon } from './Icons';

interface AdminViewProps {
  addQuiz: (quizData: { title:string; description: string; items: QuizItem[]; creator: string }) => string;
}

const AdminView: React.FC<AdminViewProps> = ({ addQuiz }) => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [creatorName, setCreatorName] = useState<string>('');
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    
    // Use functional updates to prevent stale state issues and ensure the button enables correctly.
    setFormTitle(currentTitle => currentTitle ? currentTitle : `「${file.name}」からのクイズ`);
    setFormDescription(currentDescription => currentDescription ? currentDescription : `このクイズは、PDF「${file.name}」の内容に基づいてAIが自動生成したものです。`);
  }, []);

  const handleStartGeneration = useCallback(async () => {
    if (!selectedFile || !formTitle) {
        setError("フォームのタイトルとPDFファイルは必須です。");
        setStatus(AppStatus.ERROR);
        return;
    }

    setStatus(AppStatus.EXTRACTING);
    setError(null);
    setQuizItems([]);
    setGeneratedScript('');
    setShareableUrl(null);

    try {
      const pdfText = await extractTextFromPdf(selectedFile);
      if (pdfText.trim().length < 100) {
        setError("PDFから十分なテキストを抽出できませんでした。テキストベースのPDFをお試しください。");
        setStatus(AppStatus.ERROR);
        return;
      }

      setStatus(AppStatus.GENERATING);
      const generatedQuiz = await generateQuizFromText(pdfText, questionCount);
      setQuizItems(generatedQuiz);
      setStatus(AppStatus.READY);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。';
      setError(`エラー: ${errorMessage}`);
      setStatus(AppStatus.ERROR);
    }
  }, [selectedFile, questionCount, formTitle]);

  const handleConfirmQuiz = useCallback(() => {
    if (quizItems.length > 0) {
      try {
        const newQuizId = addQuiz({ title: formTitle, description: formDescription, items: quizItems, creator: creatorName });
        const url = `${window.location.origin}${window.location.pathname}#/quiz/${newQuizId}`;
        setShareableUrl(url);
        alert('クイズが確定され、管理メニューに登録されました。');
      } catch(e) {
        console.error("Quiz confirmation failed", e);
        const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。';
        setError(`クイズの確定中にエラーが発生しました: ${errorMessage}`);
        setStatus(AppStatus.ERROR);
      }
    }
  }, [quizItems, formTitle, formDescription, creatorName, addQuiz]);

  const handleGenerateScript = useCallback((folderUrl?: string) => {
    if (quizItems.length > 0) {
      const script = generateGoogleAppsScript(quizItems, formTitle, formDescription, folderUrl);
      setGeneratedScript(script);
      setStatus(AppStatus.DONE);
    }
  }, [quizItems, formTitle, formDescription]);
  
  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setError(null);
    setQuizItems([]);
    setGeneratedScript('');
    setFormTitle('');
    setFormDescription('');
    setCreatorName('');
    setShareableUrl(null);
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen text-text-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-4xl text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-2">
            <HeaderIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tokium-green to-light-green">
              TOKIUMテスト制作サイト
            </h1>
        </div>
        <p className="text-gray-600 text-lg">
          アップロードされたPDFを参照して、AIがクイズを自動生成します。
        </p>
         <div className="mt-4 text-right">
            <a href="#/admin"
               onClick={(e) => { e.preventDefault(); window.location.hash = '#/admin'; }}
               className="text-tokium-green hover:underline font-semibold">
                管理メニュー
            </a>
        </div>
      </header>

      <main className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {status === AppStatus.IDLE && (
          <div className="space-y-6">
             <div>
              <label htmlFor="form-title" className="block text-sm font-medium text-gray-700 mb-2">
                フォームのタイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="form-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-text-black focus:outline-none focus:ring-2 focus:ring-tokium-green"
                placeholder="例：「コンプライアンス研修」理解度テスト"
                required
              />
            </div>
            
            <div>
              <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 mb-2">
                フォームの説明
              </label>
              <textarea
                id="form-description"
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-text-black focus:outline-none focus:ring-2 focus:ring-tokium-green"
                placeholder="例：このテストは、先日実施したコンプライアンス研修の理解度を確認するためのものです。"
              />
            </div>
            
            <div>
              <label htmlFor="creator-name" className="block text-sm font-medium text-gray-700 mb-2">
                作成者名
              </label>
              <input
                type="text"
                id="creator-name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-text-black focus:outline-none focus:ring-2 focus:ring-tokium-green"
                placeholder="例：山田 太郎"
              />
            </div>

            <div>
              <label htmlFor="question-count" className="block text-sm font-medium text-gray-700 mb-2">
                生成する質問の数
              </label>
              <select
                id="question-count"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-text-black focus:outline-none focus:ring-2 focus:ring-tokium-green"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <label className="block text-sm font-medium text-gray-700">
                クイズ作成元のPDFファイル <span className="text-red-500">*</span>
              </label>
              {!selectedFile ? (
                <FileUpload onFileProcess={handleFileSelect} />
              ) : (
                <div className="bg-pale-blue-bg/60 p-4 rounded-lg flex items-center justify-between transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon className="w-8 h-8 text-tokium-green flex-shrink-0" />
                    <p className="font-medium text-text-black truncate" title={selectedFile.name}>{selectedFile.name}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedFile(null); }} 
                    className="text-sm font-semibold text-tokium-green hover:text-orange transition-colors flex-shrink-0 ml-4 py-1 px-3 rounded-md border border-tokium-green/50 hover:border-orange bg-white shadow-sm"
                  >
                    変更
                  </button>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleStartGeneration}
                disabled={!selectedFile || !formTitle}
                className="w-full bg-tokium-green hover:brightness-95 transition-all text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                <PlayIcon className="w-6 h-6"/>
                実行してテストを作成
              </button>
            </div>
          </div>
        )}

        {[AppStatus.EXTRACTING, AppStatus.GENERATING].includes(status) && (
            <Loader 
              message={status === AppStatus.EXTRACTING 
                ? 'PDFからテキストを抽出中...' 
                : `AIが${questionCount}個の質問を生成中...`} 
            />
        )}
        
        {status === AppStatus.ERROR && (
            <div className="text-center">
                <p className="text-red-700 bg-red-100 p-4 rounded-lg">{error}</p>
                <button 
                    onClick={handleReset} 
                    className="mt-6 bg-orange hover:brightness-95 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    もう一度試す
                </button>
            </div>
        )}

        {[AppStatus.READY, AppStatus.DONE].includes(status) && (
          <GeneratedContent
            quizItems={quizItems}
            generatedScript={generatedScript}
            onGenerateScript={handleGenerateScript}
            onReset={handleReset}
            isDone={status === AppStatus.DONE}
            shareableUrl={shareableUrl}
            onConfirm={handleConfirmQuiz}
          />
        )}
      </main>

       <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 TOKIUM INC.</p>
      </footer>
    </div>
  );
}

export default AdminView;