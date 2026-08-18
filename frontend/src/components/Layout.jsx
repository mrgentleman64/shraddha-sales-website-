import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, ShoppingCart, Truck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { api } from '../lib/api.js';
import { applySiteContent, mergeContent } from '../lib/content.js';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Categories', path: '/categories' },
  { label: 'Brands', path: '/brands' },
  { label: 'Offers', path: '/products?badge=offer' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteContent, setSiteContent] = useState(null);
  const navigate = useNavigate();
  const content = useMemo(() => mergeContent(siteContent), [siteContent]);
  const socialLinks = Object.entries(content.social_links || {}).filter(([, value]) => value);

  useEffect(() => {
    let mounted = true;
    api.get('/content')
      .then((res) => {
        const merged = mergeContent(res.data);
        if (mounted) setSiteContent(merged);
        applySiteContent(merged);
      })
      .catch(() => applySiteContent(mergeContent(null)));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      api.get(`/search/suggestions?q=${encodeURIComponent(search)}`)
        .then((res) => setSuggestions(res.data || []))
        .catch(() => setSuggestions([]));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
    setMobileOpen(false);
  };

  const selectSuggestion = (value) => {
    setQuery(value);
    setShowSuggestions(false);
    setSuggestions([]);
    navigate(`/products?q=${encodeURIComponent(value)}`);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-900">
      <div className="bg-slate-950 text-[11px] text-slate-200">
        <div className="container mx-auto px-4 py-2 flex flex-col sm:flex-row justify-between gap-3">
          <span>{content.website_settings.announcement}</span>
          <span className="hidden sm:inline">Support: {content.contact.phone}</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/88 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center gap-4 justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {content.branding.website_logo ? (
              <img src={content.branding.website_logo} alt={content.branding.site_name} width="44" height="44" className="h-11 w-11 rounded-2xl object-contain shadow-lg" />
            ) : (
              <div className="h-11 w-11 rounded-2xl bg-navy grid place-items-center text-white shadow-lg">
                <Truck size={20} />
              </div>
            )}
            <div>
              <div className="truncate text-lg font-bold tracking-tight">{content.branding.site_name}</div>
              <div className="truncate text-[11px] uppercase text-slate-500">{content.branding.tagline}</div>
            </div>
          </Link>
          <form onSubmit={handleSearch} className="relative hidden max-w-2xl flex-1 md:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
              className="w-full rounded-full border border-slate-200 bg-slate-50/90 py-3 pl-11 pr-28 text-sm outline-none transition focus:border-navy focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="Search appliances, brands, models..."
              aria-label="Search products"
            />
            <button type="submit" className="interactive-lift absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-950">Search</button>
            <SearchSuggestions visible={showSuggestions} suggestions={suggestions} onSelect={selectSuggestion} />
          </form>
          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200 md:hidden" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `rounded-full px-3 py-2 text-sm transition ${isActive ? 'bg-blue-50 text-navy font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-navy'}`}>{item.label}</NavLink>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {user?.role === 'admin' && (
                <Link to="/admin" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100">Admin</Link>
              )}
              {user ? (
                <>
                  <Link to="/profile" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100">{user.name.split(' ')[0]}</Link>
                  <button onClick={logout} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100" aria-label="Log out"><LogOut size={16} /></button>
                </>
              ) : (
                <Link to="/login" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100">Login</Link>
              )}
              <Link to="/cart" className="relative rounded-full border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100" aria-label="Cart">
                <ShoppingCart size={18} />
                {count > 0 && <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{count}</span>}
              </Link>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none"
                placeholder="Search appliances..."
                aria-label="Search products"
              />
              <SearchSuggestions visible={showSuggestions} suggestions={suggestions} onSelect={selectSuggestion} />
            </form>
            <div className="grid gap-3">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{item.label}</Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-20 bg-slate-950 text-slate-300">
        <div className="container mx-auto px-4 py-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            {content.branding.footer_logo ? (
              <img src={content.branding.footer_logo} alt={content.branding.site_name} className="mb-4 max-h-12 object-contain" />
            ) : (
              <div className="text-white font-semibold text-lg mb-3">{content.branding.site_name}</div>
            )}
            <p className="text-sm text-slate-400">{content.footer.description}</p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">{content.footer.shop_links_title || 'Shop'}</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/brands">Brands</Link></li>
              <li><Link to="/products?badge=offer">Offers</Link></li>
              <li><Link to="/products?badge=bestseller">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">{content.footer.customer_links_title || 'Customer'}</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Contact</div>
            <div className="text-sm text-slate-400 space-y-2">
              <div>{content.contact.phone}</div>
              <div>{content.contact.email}</div>
              <div>{content.contact.locations}</div>
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socialLinks.map(([key, value]) => (
                    <a key={key} href={value} target="_blank" rel="noreferrer" className="rounded-full border border-slate-700 px-3 py-1 text-xs capitalize hover:bg-slate-800">{key}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} {content.footer.copyright}</div>
      </footer>
    </div>
  );
}

function SearchSuggestions({ visible, suggestions, onSelect }) {
  if (!visible || suggestions.length === 0) return null;
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(suggestion);
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-navy"
        >
          <Search size={15} className="text-slate-400" />
          <span className="truncate">{suggestion}</span>
        </button>
      ))}
    </div>
  );
}

