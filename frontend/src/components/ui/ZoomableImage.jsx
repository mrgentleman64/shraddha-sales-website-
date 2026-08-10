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
        className={`group relative overflow-hidden rounded-2xl ${containerClassName}`}
        onClick={() => setIsZoomed(true)}
        onMouseMove={handleMouseMove}
      >
        <LazyImage
          src={src}
          alt={alt}
          className={`${className} transition-transform duration-300 group-hover:scale-[1.03]`}
        />
        <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-2xl bg-navy p-2 text-white shadow-lg">
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
              className="absolute right-6 top-6 z-10 rounded-2xl p-2 text-white transition hover:bg-white/20"
              aria-label="Close image preview"
            >
              <X size={24} />
            </button>
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2rem] bg-slate-900"
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
