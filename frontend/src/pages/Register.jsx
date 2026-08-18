import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { fmtError } from '../lib/api.js';
import { toast } from 'sonner';
import SEO from '../components/SEO.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(state.name, state.email, state.password);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      setError(fmtError(err.response?.data?.detail || err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-shell container mx-auto px-4 py-16">
      <SEO title="Register" description="Create a Shraddha Sales account." robots="noindex, follow" canonicalPath="/register" />
      <div className="section-panel mx-auto max-w-lg p-10">
        <p className="section-eyebrow">Account</p>
        <h1 className="section-title mt-2">Create account</h1>
        <p className="section-copy mt-2">Register now to save your orders and checkout faster.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={state.name} onChange={(event) => setState({ ...state, name: event.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={state.email} onChange={(event) => setState({ ...state, email: event.target.value })} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={state.password} onChange={(event) => setState({ ...state, password: event.target.value })} required minLength={6} />
          </div>
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p className="mt-5 text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-navy">Sign in</Link></p>
      </div>
    </div>
  );
}
