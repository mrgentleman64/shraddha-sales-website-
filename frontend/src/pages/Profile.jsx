import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api, inr } from '../lib/api.js';
import { Button } from '../components/ui/button.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/orders/me', { headers: { Authorization: `Bearer ${localStorage.getItem('ss_token')}` } })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]));
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hi, {user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <div className="mt-6 space-y-4">
              {orders.length === 0 ? (
                <div className="text-slate-500">No orders yet.</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">Order #{order.id.slice(0, 8).toUpperCase()}</div>
                        <div className="text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700">{order.status}</div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4 text-sm">
                        <div className="text-slate-500">Shipping</div>
                        <div className="mt-2 text-slate-900">{order.address.address}, {order.address.city}, {order.address.state} - {order.address.pin_code}</div>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4 text-sm">
                        <div className="text-slate-500">Total</div>
                        <div className="mt-2 text-slate-900">{inr(order.total)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="addresses">
            <div className="mt-6 text-slate-500">Saved addresses will appear here after you place an order.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
