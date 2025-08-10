import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileProcess: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileProcess(file);
      } else {
        alert("PDFファイルのみアップロードできます。");
      }
    }
  }, [onFileProcess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileProcess(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-tokium-green bg-pale-blue-bg' : 'border-gray-300 hover:border-tokium-green'}`}
    >
      <input
        type="file"
        id="file-upload"
        accept="application/pdf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
        <UploadIcon />
        <p className="text-gray-600">
          <span className="font-semibold text-tokium-green">クリックしてファイルを選択</span> またはドラッグ＆ドロップ
        </p>
        <p className="text-xs text-gray-500">PDFファイルのみ</p>
      </label>
    </div>
  );
};

export default FileUpload;