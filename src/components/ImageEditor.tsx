import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { ImageType } from '../types';

interface ImageEditorProps {
  imageType: ImageType;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundIndex, setBackgroundIndex] = useState<number>(0);
  const [character, setCharacter] = useState<string>('');
  const [overlayIndex, setOverlayIndex] = useState<number>(0);
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterScale, setCharacterScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [characterSize, setCharacterSize] = useState({ width: 0, height: 0 });

  const canvasWidth = imageType === 'thumbnail' ? 1280 : 400;
  const canvasHeight = imageType === 'thumbnail' ? 720 : 400;

  const backgrounds = [
    'https://source.unsplash.com/random/1280x720?nature',
    'https://source.unsplash.com/random/1280x720?city',
    'https://source.unsplash.com/random/1280x720?technology',
    'https://source.unsplash.com/random/1280x720?abstract',
    'https://source.unsplash.com/random/1280x720?space',
  ];

  const overlays = [
    'https://via.placeholder.com/1280x720.png?text=Overlay+1',
    'https://via.placeholder.com/1280x720.png?text=Overlay+2',
    'https://via.placeholder.com/1280x720.png?text=Overlay+3',
    'https://via.placeholder.com/1280x720.png?text=Overlay+4',
    'https://via.placeholder.com/1280x720.png?text=Overlay+5',
  ];

  useEffect(() => {
    drawCanvas();
  }, [backgroundIndex, character, overlayIndex, characterPosition, characterScale]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const backgroundImg = new Image();
    backgroundImg.onload = () => {
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
      drawCharacterAndOverlay(ctx);
    };
    backgroundImg.src = backgrounds[backgroundIndex];
  };

  const drawCharacterAndOverlay = (ctx: CanvasRenderingContext2D) => {
    if (character) {
      const img = new Image();
      img.onload = () => {
        const scaledWidth = img.width * characterScale;
        const scaledHeight = img.height * characterScale;
        ctx.drawImage(
          img,
          characterPosition.x,
          characterPosition.y,
          scaledWidth,
          scaledHeight
        );
        setCharacterSize({ width: scaledWidth, height: scaledHeight });
        drawOverlay(ctx);
      };
      img.src = character;
    } else {
      drawOverlay(ctx);
    }
  };

  const drawOverlay = (ctx: CanvasRenderingContext2D) => {
    const overlayImg = new Image();
    overlayImg.onload = () => {
      ctx.drawImage(overlayImg, 0, 0, canvasWidth, canvasHeight);
    };
    overlayImg.src = overlays[overlayIndex];
  };

  const handleCharacterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCharacter(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `youtube-image-${timestamp}.png`;
    link.click();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= characterPosition.x &&
      x <= characterPosition.x + characterSize.width &&
      y >= characterPosition.y &&
      y <= characterPosition.y + characterSize.height
    ) {
      if (
        x >= characterPosition.x + characterSize.width - 20 &&
        y >= characterPosition.y + characterSize.height - 20
      ) {
        setIsResizing(true);
      } else {
        setIsDragging(true);
      }
      setDragStart({ x: x - characterPosition.x, y: y - characterPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isResizing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setCharacterPosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    } else if (isResizing) {
      const newWidth = x - characterPosition.x;
      const newHeight = y - characterPosition.y;
      const aspectRatio = characterSize.width / characterSize.height;
      const newScale = Math.min(newWidth / characterSize.width, newHeight / characterSize.height);
      setCharacterScale(newScale);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-gray-300 mb-4 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-2">Background</label>
          <select
            value={backgroundIndex}
            onChange={(e) => setBackgroundIndex(parseInt(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          >
            {backgrounds.map((_, index) => (
              <option key={index} value={index}>
                Background {index + 1}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2">Character</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCharacterUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label className="block mb-2">Overlay</label>
          <select
            value={overlayIndex}
            onChange={(e) => setOverlayIndex(parseInt(e.target.value))}
            className="w-full px-2 py-1 border rounded"
          >
            {overlays.map((_, index) => (
              <option key={index} value={index}>
                Overlay {index + 1}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
      >
        <Download className="mr-2" />
        Download Image
      </button>
    </div>
  );
};

export default ImageEditor;