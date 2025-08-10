import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-tokium-green rounded-full animate-spin"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  );
};

export default Loader;