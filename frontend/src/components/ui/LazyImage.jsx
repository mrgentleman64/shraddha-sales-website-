import { memo, useState } from 'react';

function withParams(url, params) {
  if (!url || !/^https?:\/\//i.test(url)) return url;
  try {
    const parsed = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

export function optimizedImageUrl(src, width, format = 'webp') {
  if (!src) return src;
  if (src.includes('images.unsplash.com')) {
    return withParams(src, { w: String(width), q: '70', fm: format, fit: 'crop' });
  }
  return src;
}

function LazyImage({ 
  src, 
  alt, 
  className = '', 
  containerClassName = '',
  onLoad = null,
  showSkeleton = true,
  loading = 'lazy',
  fetchPriority,
  sizes = '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw',
  widths = [320, 640, 960],
  decoding = 'async',
  width,
  height,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const srcSet = src?.includes('images.unsplash.com')
    ? widths.map((width) => `${optimizedImageUrl(src, width)} ${width}w`).join(', ')
    : undefined;

  return (
    <div className={containerClassName}>
      {isLoading && showSkeleton && (
        <div className="skeleton-shimmer absolute inset-0 rounded-[inherit]" />
      )}
      <img
        src={optimizedImageUrl(src, widths[Math.min(1, widths.length - 1)] || 640)}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
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

export default memo(LazyImage);
