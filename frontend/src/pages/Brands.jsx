import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import SEO, { breadcrumbSchema } from '../components/SEO.jsx';

export default function Brands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data)).catch(() => setBrands([]));
  }, []);

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <SEO title="Brands" description="Explore trusted appliance brands available at shradhasales." schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Brands', path: '/brands' }])} />
      <div className="mb-8">
        <p className="section-eyebrow">Authorized partners</p>
        <h1 className="section-title mt-2">Brands</h1>
        <p className="section-copy mt-2">Explore top brands, compare prices, and shop your favorite appliances.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link key={brand.id} to={`/products?brand=${brand.id}`} className="group section-panel premium-card-hover glow-hover overflow-hidden">
            <div className="h-60 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/60">
              <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-8 transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-navy">{brand.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{brand.description || 'Top quality appliances from trusted manufacturers.'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
