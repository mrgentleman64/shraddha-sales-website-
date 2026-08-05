import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import LazyImage from '../components/ui/LazyImage.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="mt-2 text-sm text-slate-500">Browse appliances by category and refine your search instantly.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} to={`/products?category=${category.id}`} className="group rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="h-60 overflow-hidden bg-slate-100 relative">
              <LazyImage 
                src={category.image} 
                alt={category.name} 
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105 w-full" 
                containerClassName="w-full h-full relative"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
