import React, { useState, useRef } from 'react';
import { Download, Image as ImageIcon, User } from 'lucide-react';
import ImageEditor from './components/ImageEditor';
import { ImageType } from './types';

function App() {
  const [imageType, setImageType] = useState<ImageType>('thumbnail');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Image Creator</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-md ${
              imageType === 'thumbnail'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setImageType('thumbnail')}
          >
            YouTube Thumbnail
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              imageType === 'custom'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setImageType('custom')}
          >
            400x400px Custom Image
          </button>
        </div>
        <ImageEditor imageType={imageType} />
      </div>
    </div>
  );
}

export default App;