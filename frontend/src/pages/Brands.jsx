import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';

export default function Brands() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    api.get('/brands').then((res) => setBrands(res.data)).catch(() => setBrands([]));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Brands</h1>
        <p className="mt-2 text-sm text-slate-500">Explore top brands, compare prices, and shop your favorite appliances.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link key={brand.id} to={`/products?brand=${brand.id}`} className="group rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="h-60 overflow-hidden bg-slate-100">
              <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain p-8 transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">{brand.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{brand.description || 'Top quality appliances from trusted manufacturers.'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
