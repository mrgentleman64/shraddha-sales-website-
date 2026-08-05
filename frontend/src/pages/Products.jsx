import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const brand = searchParams.get('brand') || '';
  const badge = searchParams.get('badge') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => setCategories([]));
    api.get('/subcategories').then((res) => setSubcategories(res.data)).catch(() => setSubcategories([]));
    api.get('/brands').then((res) => setBrands(res.data)).catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (subcategory) params.set('subcategory', subcategory);
    if (brand) params.set('brand', brand);
    if (badge) params.set('badge', badge);
    api.get(`/products?${params.toString()}`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, subcategory, brand, badge]);

  const visibleSubcategories = subcategories.filter((item) => !category || item.category_id === category);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === 'category') params.delete('subcategory');
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Shop Products</h1>
        <p className="mt-2 text-sm text-slate-500">Browse our full product catalog with filters for categories, brands and offers.</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Search</div>
            <Input value={q} onChange={(event) => updateParam('q', event.target.value)} placeholder="Search products" />
          </div>
          <FilterSection title="Categories">
            {categories.map((cat) => (
              <FilterItem key={cat.id} active={category === cat.id} onClick={() => updateParam('category', category === cat.id ? '' : cat.id)}>
                {cat.name}
              </FilterItem>
            ))}
          </FilterSection>
          {visibleSubcategories.length > 0 && (
            <FilterSection title="Subcategories">
              {visibleSubcategories.map((subcat) => (
                <FilterItem key={subcat.id} active={subcategory === subcat.id} onClick={() => updateParam('subcategory', subcategory === subcat.id ? '' : subcat.id)}>
                  {subcat.name}
                </FilterItem>
              ))}
            </FilterSection>
          )}
          <FilterSection title="Brands">
            {brands.map((brandItem) => (
              <FilterItem key={brandItem.id} active={brand === brandItem.id} onClick={() => updateParam('brand', brand === brandItem.id ? '' : brandItem.id)}>
                {brandItem.name}
              </FilterItem>
            ))}
          </FilterSection>
          <FilterSection title="Tags">
            {['offer', 'bestseller', 'featured', 'new'].map((tag) => (
              <FilterItem key={tag} active={badge === tag} onClick={() => updateParam('badge', badge === tag ? '' : tag)}>{tag}</FilterItem>
            ))}
          </FilterSection>
        </aside>
        <section>
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">No products found.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterItem({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${active ? 'border-navy bg-navy/10 text-navy' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
      {children}
    </button>
  );
}
