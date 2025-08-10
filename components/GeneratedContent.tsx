import React, { useState, useEffect } from 'react';
import { QuizItem } from '../types';
import { CopyIcon, CheckIcon, BackIcon, ScriptIcon, LinkIcon, ChevronUpIcon } from './Icons';
import FolderUrlModal from './FolderUrlModal';
import ConfirmModal from './ConfirmModal';

interface GeneratedContentProps {
  quizItems: QuizItem[];
  generatedScript: string;
  onGenerateScript: (folderUrl?: string) => void;
  onReset: () => void;
  isDone: boolean;
  shareableUrl: string | null;
  onConfirm: () => void;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ quizItems, generatedScript, onGenerateScript, onReset, isDone, shareableUrl, onConfirm }) => {
  const [scriptCopied, setScriptCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [isScriptSectionVisible, setIsScriptSectionVisible] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'url' | 'gas'>('url');

  useEffect(() => {
    if (isDone) {
      setOutputFormat('gas');
    }
  }, [isDone]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript).then(() => {
      setScriptCopied(true);
      setTimeout(() => setScriptCopied(false), 2000);
    });
  };

  const handleCopyUrl = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl).then(() => {
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      });
    }
  };
  
  const handleGenerateButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (url: string) => {
    onGenerateScript(url);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-black mb-4">{ isDone ? "生成された質問と回答" : "プレビュー（管理者用）" }</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-4 -mr-4 rounded-lg">
          {quizItems.map((item, index) => (
            <div key={index} className="bg-pale-blue-bg/60 p-4 rounded-lg">
              <p className="font-semibold text-gray-800 mb-3">{index + 1}. {item.question}</p>
              <ul className="space-y-2">
                {item.options.map((option, optionIndex) => (
                  <li
                    key={optionIndex}
                    className={`flex items-center text-sm px-3 py-2 rounded-md ${option === item.answer ? 'bg-light-green/30 text-tokium-green font-semibold' : 'bg-white text-gray-700'}`}
                  >
                    {option === item.answer && <CheckIcon className="w-5 h-5 mr-2 text-tokium-green" />}
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <label htmlFor="output-format" className="block text-sm font-medium text-gray-700 mb-2">
          出力形式の選択
        </label>
        <select
          id="output-format"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as 'url' | 'gas')}
          className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-text-black focus:outline-none focus:ring-2 focus:ring-tokium-green"
          disabled={!shareableUrl}
        >
          <option value="url">URL形式</option>
          <option value="gas">Google Apps Script形式</option>
        </select>
      </div>

      {outputFormat === 'url' && (
        <div>
          {shareableUrl ? (
            <div>
                <h2 className="text-2xl font-bold text-text-black mb-4">共有リンク</h2>
                <p className="text-sm text-gray-600 mb-2">このリンクを回答者に共有して、テストを受けてもらいましょう。</p>
                <div className="relative bg-gray-100 rounded-lg p-2 flex items-center gap-2 border border-gray-200">
                    <LinkIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <input type="text" readOnly value={shareableUrl} className="bg-transparent w-full text-sm text-gray-700 focus:outline-none"/>
                    <button 
                        onClick={handleCopyUrl} 
                        className="bg-white hover:bg-gray-100 text-tokium-green font-semibold py-1 px-3 rounded-md border border-gray-300 transition-colors text-sm flex items-center gap-1.5"
                    >
                        {urlCopied ? <><CheckIcon className="w-4 h-4 text-light-green"/>コピー完了</> : 'コピー'}
                    </button>
                </div>
            </div>
          ) : (
             <div className="mt-2 bg-pale-blue-bg/60 p-4 rounded-lg text-center text-gray-600 border border-tokium-green/20">
                <p>下の「確定」ボタンを押すと、共有用のURLがここに表示されます。</p>
            </div>
          )}
        </div>
      )}
      
      {outputFormat === 'gas' && (
        <>
          {!isDone && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500 mb-4">Googleフォームとして作成する場合は、以下のボタンをクリックしてください。</p>
              <button
                onClick={handleGenerateButtonClick}
                disabled={!shareableUrl}
                className="w-full sm:w-auto bg-tokium-green hover:brightness-95 transition-all text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={!shareableUrl ? "先にクイズを確定してください" : ""}
              >
                <ScriptIcon />
                Google Apps Scriptを生成
              </button>
            </div>
          )}

          {isDone && generatedScript && (
            <div>
              <button
                onClick={() => setIsScriptSectionVisible(!isScriptSectionVisible)}
                className="w-full flex justify-between items-center text-left py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-tokium-green"
                aria-expanded={isScriptSectionVisible}
                aria-controls="script-section"
              >
                <h2 className="text-2xl font-bold text-text-black">Google Apps Script</h2>
                <ChevronUpIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isScriptSectionVisible ? '' : 'rotate-180'}`} />
              </button>
              
              <div id="script-section" className={`overflow-hidden transition-all duration-300 ${isScriptSectionVisible ? 'max-h-full' : 'max-h-0'}`}>
                <div className="mt-4">
                    <div className="relative bg-text-black rounded-lg p-4 font-mono">
                      <button
                        onClick={handleCopyScript}
                        className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors"
                        aria-label="Copy script"
                      >
                        {scriptCopied ? <CheckIcon className="w-5 h-5 text-light-green" /> : <CopyIcon />}
                      </button>
                      <pre className="text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                        <code>{generatedScript}</code>
                      </pre>
                    </div>
                    <div className="mt-6 p-4 bg-orange/10 border border-orange/30 rounded-lg">
                        <h3 className="font-bold text-orange mb-2">使い方</h3>
                        <ol className="list-decimal list-inside text-gray-700 space-y-1 text-sm">
                            <li>上記の「<span className="font-mono bg-gray-200 px-1 py-0.5 rounded">スクリプトをコピー</span>」ボタンを押します。</li>
                            <li><a href="https://script.google.com/home/projects/create" target="_blank" rel="noopener noreferrer" className="text-tokium-green hover:underline">script.google.com</a> を開き、新しいプロジェクトを作成します。</li>
                            <li>エディタ内の既存のコードを全て削除し、コピーしたコードを貼り付けます。</li>
                            <li>上部の <span className="font-bold">▶️ 実行</span> ボタンをクリックします。</li>
                            <li>初回は承認が必要です。画面の指示に従い、スクリプトの実行を許可してください。</li>
                            <li>完了すると、あなたのGoogleドライブに新しいフォームが作成されます。</li>
                        </ol>
                    </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
         <button
            onClick={onReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
          >
            <BackIcon />
            別のPDFで試す
          </button>
          
          {!shareableUrl && (
            <button
                onClick={() => setIsConfirmModalOpen(true)}
                className="bg-orange hover:brightness-95 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            >
                <CheckIcon />
                確定
            </button>
          )}
      </div>
      
      <FolderUrlModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
            onConfirm();
            setIsConfirmModalOpen(false);
        }}
        title="クイズの確定"
        message="この内容でクイズを確定し、管理メニューに登録します。よろしいですか？"
      />
    </div>
  );
};

export default GeneratedContent;