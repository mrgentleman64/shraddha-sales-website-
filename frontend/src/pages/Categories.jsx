import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import LazyImage from '../components/ui/LazyImage.jsx';
import SEO, { breadcrumbSchema } from '../components/SEO.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <SEO title="Categories" description="Browse appliance categories at shradhasales." schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories' }])} />
      <div className="mb-8">
        <p className="section-eyebrow">Shop by need</p>
        <h1 className="section-title mt-2">Categories</h1>
        <p className="section-copy mt-2">Browse appliances by category and refine your search instantly.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} to={`/products?category=${category.id}`} className="group section-panel premium-card-hover glow-hover overflow-hidden">
            <div className="h-60 overflow-hidden bg-slate-100 relative">
              <LazyImage 
                src={category.image} 
                alt={category.name} 
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105 w-full" 
                containerClassName="w-full h-full relative"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 group-hover:text-navy">{category.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
