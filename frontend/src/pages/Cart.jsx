import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { inr } from '../lib/api.js';
import { Minus, Plus, Trash2 } from 'lucide-react';
import LazyImage from '../components/ui/LazyImage.jsx';
import SEO from '../components/SEO.jsx';

export default function Cart() {
  const { user } = useAuth();
  const { items, update, remove, subtotal } = useCart();
  const navigate = useNavigate();
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal === 0 ? 0 : 199;
  const total = subtotal + gst + shipping;

  if (!user) {
    return (
      <div className="page-shell container mx-auto px-4 py-16 text-center">
        <SEO title="Cart" description="Review your Shraddha Sales cart and continue shopping." robots="noindex, follow" canonicalPath="/cart" />
        <h1 className="text-3xl font-bold text-slate-900">Your cart is waiting</h1>
        <p className="mt-3 text-slate-500">Please login to view your cart.</p>
        <Link to="/login" className="interactive-lift mt-6 inline-flex rounded-2xl bg-navy px-6 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(30,58,138,0.22)]">Login</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-shell container mx-auto px-4 py-16 text-center">
        <SEO title="Cart" description="Your Shraddha Sales cart is empty. Browse products to continue." robots="noindex, follow" canonicalPath="/cart" />
        <h1 className="text-3xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-3 text-slate-500">Add products to continue.</p>
        <Link to="/products" className="interactive-lift mt-6 inline-flex rounded-2xl bg-navy px-6 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(30,58,138,0.22)]">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <SEO title="Shopping Cart" description="Review selected appliances in your Shraddha Sales shopping cart." robots="noindex, follow" canonicalPath="/cart" />
      <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="section-panel premium-card-hover flex flex-col gap-4 p-5 sm:flex-row">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-50">
                <LazyImage 
                  src={item.product?.images?.[0]} 
                  alt={item.product?.name} 
                  className="max-h-24 object-contain w-full" 
                  containerClassName="w-full h-full relative"
                />
              </div>
              <div className="flex-1">
                <Link to={`/product/${item.product_id}`} className="font-semibold text-slate-900 hover:text-navy">{item.product?.name}</Link>
                <p className="text-sm text-slate-500 mt-2">{item.product?.model_number}</p>
                <p className="mt-3 text-xl font-bold text-slate-900">{inr(item.product?.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-3">
                <button type="button" onClick={() => remove(item.id)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                <div className="flex items-center rounded-3xl border border-slate-200 bg-slate-50">
                  <button type="button" onClick={() => update(item.id, item.quantity - 1)} className="px-3 py-2 text-slate-600"><Minus size={16} /></button>
                  <span className="px-4 text-sm font-semibold text-slate-900">{item.quantity}</span>
                  <button type="button" onClick={() => update(item.id, item.quantity + 1)} className="px-3 py-2 text-slate-600"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="section-panel p-6">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span>GST (18%)</span><span>{inr(gst)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{inr(shipping)}</span></div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900 flex justify-between">Total <span>{inr(total)}</span></div>
          <button onClick={() => navigate('/checkout')} className="interactive-lift mt-6 w-full rounded-2xl bg-navy px-5 py-3 font-semibold text-white shadow-[0_12px_28px_rgba(30,58,138,0.22)] hover:bg-blue-950">Proceed to checkout</button>
        </div>
      </div>
    </div>
  );
}
