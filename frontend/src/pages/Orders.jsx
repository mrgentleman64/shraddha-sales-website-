import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api, inr } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import { ShieldCheck, ShoppingBag } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('ss_token');
    const endpoint = user.role === 'admin' ? '/admin/orders' : '/orders/me';
    api.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [user]);

  if (!user) {
    return (
      <div className="page-shell container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Please login to view orders</h1>
        <p className="mt-3 text-slate-500">Your order history and admin order list appear here.</p>
        <Button onClick={() => navigate('/login')} className="mt-6">Login</Button>
      </div>
    );
  }

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">{user.role === 'admin' ? 'Operations' : 'Purchases'}</p>
          <h1 className="section-title mt-2">{user.role === 'admin' ? 'All Orders' : 'My Orders'}</h1>
          <p className="section-copy mt-2">{user.role === 'admin' ? 'Manage order status and track revenue.' : 'Review your recent purchases.'}</p>
        </div>
        <div className="soft-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700">
          <ShieldCheck size={18} /> {orders.length} orders
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="section-panel p-10 text-center text-slate-500">No orders found.</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="section-panel p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-slate-500">Order ID</div>
                  <div className="text-lg font-semibold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</div>
                </div>
                <div className="soft-chip px-4 py-2 text-sm font-semibold text-slate-700">{order.status}</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Total</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{inr(order.total)}</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Customer</div>
                  <div className="mt-2 text-slate-900">{order.address.full_name}</div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Placed on</div>
                  <div className="mt-2 text-slate-900">{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Items</div>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  {order.items.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between gap-3">
                      <div>{item.name} x {item.quantity}</div>
                      <div className="font-semibold text-slate-900">{inr(item.line_total)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="sm" variant="outline">View details</Button>
                <Button size="sm">Reorder</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
