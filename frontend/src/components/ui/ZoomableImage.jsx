import { useState, useRef } from 'react';
import { X, ZoomIn } from 'lucide-react';
import LazyImage from './LazyImage.jsx';

export default function ZoomableImage({ 
  src, 
  alt, 
  className = '',
  containerClassName = '' 
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative group overflow-hidden cursor-zoom-in rounded-2xl ${containerClassName}`}
        onClick={() => setIsZoomed(true)}
        onMouseMove={handleMouseMove}
      >
        <LazyImage
          src={src}
          alt={alt}
          className={`${className} group-hover:scale-110 transition-transform duration-300`}
        />
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-navy text-white p-2 rounded-lg shadow-lg">
            <ZoomIn size={20} />
          </div>
        </div>
      </div>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-lg transition z-10"
            >
              <X size={24} />
            </button>
            <div
              className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain"
                style={{
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
