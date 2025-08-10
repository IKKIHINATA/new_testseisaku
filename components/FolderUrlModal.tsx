import React, { useState, useEffect } from 'react';
import { ScriptIcon } from './Icons';

interface FolderUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

const FolderUrlModal: React.FC<FolderUrlModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [url, setUrl] = useState('');

  // Reset the URL when the modal is closed.
  useEffect(() => {
    if (!isOpen) {
      setUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  // Handle clicks on the overlay to close the modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-text-black mb-4">格納先を指定してください</h2>
          <p className="text-gray-600 mb-6">生成されるGoogleフォームを格納したいGoogleドライブのフォルダURLを入力してください。空欄の場合は、マイドライブの直下に作成されます。</p>
          
          <div>
            <label htmlFor="folder-url" className="block text-sm font-medium text-gray-700 mb-2">
              Googleドライブ フォルダURL
            </label>
            <input
              type="url"
              id="folder-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-text-black focus:outline-none focus:ring-2 focus:ring-tokium-green"
              placeholder="https://drive.google.com/drive/folders/..."
            />
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-tokium-green hover:brightness-95 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            >
              <ScriptIcon />
              スクリプトを生成
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderUrlModal;
