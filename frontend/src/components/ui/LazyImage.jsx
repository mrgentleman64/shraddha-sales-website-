import { useState, useEffect, useRef } from 'react';

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  containerClassName = '',
  onLoad = null,
  showSkeleton = true 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          const img = new Image();
          img.onload = () => {
            imgRef.current.src = src;
            setIsLoading(false);
            onLoad?.();
          };
          img.onerror = () => {
            setHasError(true);
            setIsLoading(false);
          };
          img.src = src;
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, onLoad]);

  return (
    <div className={containerClassName}>
      {isLoading && showSkeleton && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse rounded-inherit" />
      )}
      <img
        ref={imgRef}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {hasError && (
        <div className={`flex items-center justify-center bg-slate-100 text-slate-500 text-sm ${className}`}>
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
}
