# Shraddha Sales - Image Component API Reference

## LazyImage Component

### Overview
A lightweight lazy-loading image component with skeleton animation and error handling.

### Import
```jsx
import LazyImage from '../components/ui/LazyImage.jsx';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image URL to load |
| `alt` | string | required | Alt text for accessibility |
| `className` | string | `''` | Tailwind classes for img element |
| `containerClassName` | string | `''` | Tailwind classes for wrapper div |
| `onLoad` | function | `null` | Callback when image loads successfully |
| `showSkeleton` | boolean | `true` | Show shimmer animation while loading |

### Basic Usage
```jsx
<LazyImage 
  src="/images/products/water-cooler.svg"
  alt="Blue Star Water Cooler"
  className="w-full h-full object-contain"
  containerClassName="bg-slate-50 rounded-lg"
/>
```

### Advanced Usage
```jsx
// With callback
<LazyImage 
  src={imageUrl}
  alt="Product"
  className="max-h-96 object-contain"
  containerClassName="relative w-full"
  onLoad={() => console.log('Image loaded!')}
  showSkeleton={true}
/>

// Thumbnail without skeleton
<LazyImage 
  src={thumbUrl}
  alt="Thumbnail"
  className="w-20 h-20 object-contain"
  containerClassName="rounded-lg border border-slate-200"
  showSkeleton={false}
/>
```

### How It Works
1. Component renders with relative container
2. Intersection Observer monitors viewport
3. When image enters viewport (50px before), load begins
4. Skeleton animation shows while loading
5. Image fades in smoothly (300ms)
6. Error fallback displays if load fails
7. Observer cleanup on unmount

### Performance Characteristics
- **Lazy Load Margin:** 50px (customizable)
- **Fade Duration:** 300ms
- **Skeleton Animation:** 2s loop
- **Memory:** ~1.8 KB minified
- **Dependencies:** Native browser APIs only

### Error Handling
```jsx
// If image fails to load:
// - Component catches error
// - Shows "Image unavailable" text
// - Maintains layout integrity
// - No console errors thrown
```

---

## ZoomableImage Component

### Overview
Interactive image with click-to-zoom fullscreen modal, perfect for product detail pages.

### Import
```jsx
import ZoomableImage from '../components/ui/ZoomableImage.jsx';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | required | Image URL to zoom |
| `alt` | string | required | Alt text for accessibility |
| `className` | string | `''` | Tailwind classes for img element |
| `containerClassName` | string | `''` | Tailwind classes for wrapper |

### Basic Usage
```jsx
<ZoomableImage 
  src={product.images[0]}
  alt={product.name}
  className="max-h-full object-contain w-full"
  containerClassName="bg-slate-50 p-8 rounded-2xl"
/>
```

### Advanced Usage with Multiple Images
```jsx
// Product detail gallery
{product.images?.map((image, index) => (
  <ZoomableImage
    key={index}
    src={image}
    alt={`${product.name} - Image ${index + 1}`}
    className="max-h-96 object-contain"
    containerClassName="rounded-lg hover:shadow-lg"
  />
))}
```

### User Interactions
1. **Hover:** Zoom icon appears in top-right corner
2. **Click:** Fullscreen modal opens with dark overlay
3. **Click Image:** In modal, click to close
4. **Click Outside:** In modal, click border to close
5. **Keyboard:** Press Escape to close (future enhancement)

### Modal Features
- Dark overlay (80% opacity)
- Centered image display
- Close button (X) in top-right
- Click-outside to dismiss
- Smooth fade-in animation
- Mouse position tracking (future enhancement)

### Styling Customization
```jsx
// Large product image
<ZoomableImage 
  src={mainImage}
  containerClassName="min-h-96 sm:min-h-[500px] bg-white rounded-3xl p-8"
/>

// Thumbnail gallery
<ZoomableImage 
  src={thumbImage}
  containerClassName="h-20 w-20 rounded-lg border-2 border-slate-200"
/>
```

---

## Usage Patterns

### Pattern 1: Product Cards
```jsx
import LazyImage from './LazyImage.jsx';

export default function ProductCard({ product }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-slate-50 p-4 h-64">
        <LazyImage 
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-contain"
          containerClassName="relative"
        />
      </div>
      <div className="p-4">
        <h3>{product.name}</h3>
        <p>{product.price}</p>
      </div>
    </div>
  );
}
```

### Pattern 2: Product Detail with Zoom
```jsx
import ZoomableImage from './ZoomableImage.jsx';
import LazyImage from './LazyImage.jsx';

export default function ProductDetail({ product }) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <>
      <div className="rounded-2xl bg-slate-50 p-8">
        <ZoomableImage 
          src={product.images?.[activeImage]}
          alt={product.name}
          className="w-full h-96 object-contain"
          containerClassName="flex items-center justify-center"
        />
      </div>
      
      <div className="flex gap-2 mt-4 overflow-x-auto">
        {product.images?.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`h-20 w-20 rounded-lg border p-2 ${
              activeImage === idx ? 'border-navy' : 'border-slate-200'
            }`}
          >
            <LazyImage 
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-contain"
              containerClassName="relative"
              showSkeleton={false}
            />
          </button>
        ))}
      </div>
    </>
  );
}
```

### Pattern 3: Category Grid
```jsx
import LazyImage from './LazyImage.jsx';

export default function CategoryGrid({ categories }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div key={category.id} className="rounded-lg overflow-hidden border group hover:shadow-lg">
          <div className="h-48 overflow-hidden bg-slate-100">
            <LazyImage 
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              containerClassName="relative"
            />
          </div>
          <div className="p-4">
            <h3>{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 4: Image Gallery Modal
```jsx
import ZoomableImage from './ZoomableImage.jsx';
import { useState } from 'react';

export default function ImageGallery({ images }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      <ZoomableImage 
        src={images[current]}
        alt={`Image ${current + 1}`}
        className="w-full h-96 object-contain"
        containerClassName="bg-slate-50 rounded-xl p-8"
      />
      
      <div className="flex gap-2 justify-center">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-16 w-16 rounded border-2 p-1 ${
              current === idx 
                ? 'border-navy' 
                : 'border-slate-300 hover:border-slate-400'
            }`}
          >
            <img 
              src={img} 
              alt={`Thumb ${idx}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Integration Examples

### With API/Database
```jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import LazyImage from './LazyImage.jsx';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <div key={product.id} className="rounded-lg border overflow-hidden">
          <LazyImage 
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-48 object-contain"
            containerClassName="bg-slate-50 p-4"
            onLoad={() => console.log(`Loaded: ${product.name}`)}
          />
          <div className="p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-slate-500">${product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### With Filtering and Search
```jsx
import { useState, useMemo } from 'react';
import LazyImage from './LazyImage.jsx';

export default function FilteredProductGallery({ products, searchQuery }) {
  const filtered = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [products, searchQuery]
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {filtered.length > 0 ? (
        filtered.map(product => (
          <div key={product.id} className="group rounded-lg border hover:shadow-lg transition">
            <div className="relative overflow-hidden bg-slate-50 h-56">
              <LazyImage 
                src={product.images?.[0]}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                containerClassName="relative"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900">{product.name}</h3>
              <p className="text-amber-600 font-bold mt-2">₹{product.price}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="col-span-full text-center text-slate-500">No products found</p>
      )}
    </div>
  );
}
```

---

## Customization Examples

### Custom Skeleton Color
Edit `LazyImage.jsx`:
```jsx
// Change skeleton color
<div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 animate-pulse" />
```

### Custom Zoom Colors
Edit `ZoomableImage.jsx`:
```jsx
// Change modal background
className="fixed inset-0 z-50 bg-navy/90 flex items-center justify-center"

// Change close button background
className="bg-white/20 hover:bg-white/30 text-white"
```

### Disable Animations
```jsx
// In index.css, disable animations
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 1; }  /* No change */
}

// Or use Tailwind's motion-safe prefix
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

---

## Performance Tips

### 1. Image Optimization
```jsx
// Use optimized images
// Good: 
src="/images/products/water-cooler-optimized.svg"  // ~15-30 KB

// Avoid:
src="/images/products/water-cooler-full-resolution.png"  // ~500+ KB
```

### 2. Batch Loading
```jsx
// Load images in batches to avoid overwhelming browser
{products.slice(0, 12).map(p => (
  <LazyImage src={p.image} ... />
))}

// Load more on scroll (implement later)
```

### 3. Caching
```jsx
// Browser automatically caches via HTTP headers
// Ensure your server returns proper cache headers
Cache-Control: public, max-age=31536000  // 1 year
```

### 4. CDN Usage (Future)
```jsx
// Use image CDN for optimization
<LazyImage 
  src={`https://cdn.example.com/images/${id}?w=400&q=80`}
  alt="Product"
/>
```

---

## Browser DevTools Tips

### Check Lazy Loading
1. Open DevTools → Network tab
2. Scroll through page
3. Images should load as you scroll (not all at once)

### Check Zoom Functionality
1. Open DevTools → Elements tab
2. Click image zoom icon
3. Modal should appear in DOM
4. Check z-index layers

### Performance Analysis
1. Open DevTools → Lighthouse
2. Run Performance audit
3. Check "Largest Contentful Paint"
4. Verify lazy loading is working

---

## Troubleshooting

### Images Not Lazy Loading
```jsx
// Check Intersection Observer support
if (!('IntersectionObserver' in window)) {
  console.warn('IntersectionObserver not supported');
}

// Use polyfill if needed
// npm install intersection-observer
```

### Zoom Not Working
```jsx
// Check modal is rendering
// Open DevTools and search for: className="fixed inset-0 z-50"

// Check z-index conflicts
// Ensure no parent has z-50 or higher
```

### Images Breaking Layout
```jsx
// Always use container className for sizing
<LazyImage 
  containerClassName="w-full h-64 bg-slate-50"  // Add sizing
  className="w-full h-full object-contain"
/>
```

---

## Future Enhancements

### Planned Features
- [ ] AVIF format support
- [ ] WebP with fallback
- [ ] Blur-up loading effect
- [ ] 360° product viewer
- [ ] Video thumbnail support
- [ ] Image comparison slider
- [ ] Analytics tracking
- [ ] Keyboard navigation in zoom

### Possible Integrations
- Cloudinary for optimization
- Imgix for responsive images
- Cloudflare for CDN
- AWS CloudFront for distribution
- ImageKit for on-the-fly optimization

---

## Support Reference

For issues:
1. Check console for error messages
2. Verify image URLs are accessible
3. Check browser compatibility
4. Review troubleshooting section
5. Check GitHub issues
6. Contact support

---

**Version:** 1.0
**Last Updated:** 2026-07-07
**Maintained By:** Development Team
