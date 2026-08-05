import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { fmtError } from '../lib/api.js';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(fmtError(err.response?.data?.detail || err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-slate-900">Welcome back</h1>
          <p className="max-w-xl text-slate-600">Login to manage orders, save your shipping address, and checkout faster.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Sign in</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Button type="submit" disabled={busy} className="w-full">{busy ? 'Signing in…' : 'Sign in'}</Button>
          </form>
          <p className="mt-4 text-sm text-slate-500">New to Shraddha Sales? <Link to="/register" className="font-semibold text-navy">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
