import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { inr } from '../lib/api.js';
import { toast } from 'sonner';
import LazyImage from './ui/LazyImage.jsx';
import { Badge } from './ui/badge.jsx';

const badgeStyles = {
  offer: 'danger',
  featured: 'navy',
  bestseller: 'success',
  new: 'accent',
};

function ProductCard({ product }) {
  const { add } = useCart();
  const { user } = useAuth();

  const handleAdd = useCallback(async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Login to add items to cart');
      return;
    }
    await add(product.id, 1);
    toast.success('Added to cart');
  }, [add, product.id, user]);

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div className="section-panel premium-card-hover glow-hover h-full overflow-hidden flex flex-col">
        <div className="relative grid h-64 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 p-5">
          <LazyImage 
            src={product.images?.[0]} 
            alt={product.name} 
            className="max-h-full object-contain transition-transform duration-300 group-hover:scale-105 w-full" 
            containerClassName="w-full h-full relative"
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            width="320"
            height="256"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {(product.badges || []).slice(0, 2).map((badge) => (
              <Badge key={badge} variant={badgeStyles[badge] || 'default'}>{badge}</Badge>
            ))}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500">
            {product.brand?.logo ? <img src={product.brand.logo} alt={product.brand.name} width="96" height="24" className="h-4 object-contain" loading="lazy" decoding="async" /> : null}
            <span>{product.brand?.name}</span>
          </div>
          <h3 className="mb-2 line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-navy">{product.name}</h3>
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-amber-700">
            <Star size={14} aria-hidden="true" />
            <span>{product.rating?.toFixed(1)}</span>
          </div>
          <div className="mt-auto">
            <div className="flex items-end gap-3">
              <div className="text-2xl font-bold text-slate-900">{inr(product.price)}</div>
              {product.mrp > product.price && <div className="text-sm text-slate-600 line-through">{inr(product.mrp)}</div>}
            </div>
            <button onClick={handleAdd} className="interactive-lift mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(30,58,138,0.2)] hover:bg-blue-950">
              <ShoppingCart size={16} className="mr-2" aria-hidden="true" /> Add to cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCard);

