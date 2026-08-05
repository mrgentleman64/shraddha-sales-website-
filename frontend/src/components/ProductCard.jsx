import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { inr } from '../lib/api.js';
import { toast } from 'sonner';
import LazyImage from './ui/LazyImage.jsx';

const badgeStyles = {
  offer: 'bg-red-500 text-white',
  featured: 'bg-navy text-white',
  bestseller: 'bg-emerald-600 text-white',
  new: 'bg-amber-500 text-white',
};

export default function ProductCard({ product }) {
  const { add } = useCart();
  const { user } = useAuth();

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!user) {
      toast.error('Login to add items to cart');
      return;
    }
    await add(product.id, 1);
    toast.success('Added to cart');
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden card-hover h-full flex flex-col">
        <div className="relative bg-slate-50 p-5 h-64 grid place-items-center overflow-hidden">
          <LazyImage 
            src={product.images?.[0]} 
            alt={product.name} 
            className="max-h-full object-contain transition-transform duration-300 group-hover:scale-105 w-full" 
            containerClassName="w-full h-full relative"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {(product.badges || []).slice(0, 2).map((badge) => (
              <span key={badge} className={`text-[10px] font-semibold uppercase tracking-[0.2em] rounded-full px-2 py-1 ${badgeStyles[badge] || 'bg-slate-200 text-slate-700'}`}>{badge}</span>
            ))}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">
            {product.brand?.logo ? <img src={product.brand.logo} alt={product.brand.name} className="h-4 object-contain" /> : null}
            <span>{product.brand?.name}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm text-amber-500 mb-4">
            <Star size={14} />
            <span>{product.rating?.toFixed(1)}</span>
          </div>
          <div className="mt-auto">
            <div className="flex items-end gap-3">
              <div className="text-2xl font-bold text-slate-900">{inr(product.price)}</div>
              {product.mrp > product.price && <div className="text-sm text-slate-400 line-through">{inr(product.mrp)}</div>}
            </div>
            <button onClick={handleAdd} className="mt-4 inline-flex items-center justify-center rounded-2xl bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 w-full">
              <ShoppingCart size={16} className="mr-2" /> Add to cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
