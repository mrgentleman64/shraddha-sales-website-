import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { api, inr } from '../lib/api.js';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { toast } from 'sonner';
import SEO from '../components/SEO.jsx';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', address: '', city: '', state: '', pin_code: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, full_name: user.name || '', email: user.email || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (items.length === 0) navigate('/cart');
  }, [items, navigate, user]);

  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal === 0 ? 0 : 199;
  const total = subtotal + gst + shipping;

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await api.post('/orders', { address: form, payment_method: 'COD' }, { headers: { Authorization: `Bearer ${localStorage.getItem('ss_token')}` } });
      toast.success('Order placed successfully');
      await refresh();
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <SEO title="Checkout" description="Complete your shradhasales appliance order with secure checkout." />
      <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="section-panel space-y-6 p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Shipping details</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" id="full_name" value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value })} />
            <Field label="Phone" id="phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <Field label="Email" id="email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <Field label="PIN code" id="pin_code" value={form.pin_code} onChange={(value) => setForm({ ...form, pin_code: value })} />
            <div className="sm:col-span-2"><Field label="Address" id="address" value={form.address} onChange={(value) => setForm({ ...form, address: value })} /></div>
            <Field label="City" id="city" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
            <Field label="State" id="state" value={form.state} onChange={(value) => setForm({ ...form, state: value })} />
          </div>
          <div className="rounded-3xl border border-navy/10 bg-navy/5 p-5">
            <p className="text-sm font-semibold text-navy">Payment method</p>
            <p className="mt-2 text-sm text-slate-600">Cash on Delivery (COD) — pay when your order arrives.</p>
          </div>
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Placing order…' : 'Place order'}</Button>
        </form>
        <aside className="section-panel p-8">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 text-sm text-slate-700">
                <div className="max-w-[60%]">{item.product?.name} × {item.quantity}</div>
                <div className="font-semibold text-slate-900">{inr(item.product?.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between"><span>GST</span><span>{inr(gst)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{inr(shipping)}</span></div>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900 flex justify-between">Total <span>{inr(total)}</span></div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, id, value, onChange, type = 'text' }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
    </div>
  );
}
