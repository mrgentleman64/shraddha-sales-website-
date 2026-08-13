import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import ProductCard from '../components/ProductCard.jsx';
import SEO, { breadcrumbSchema } from '../components/SEO.jsx';
import { Input } from '../components/ui/input.jsx';
import { ProductGridSkeleton } from '../components/ui/skeleton.jsx';
import { EmptyState } from '../components/ui/empty-state.jsx';
import { Breadcrumbs } from '../components/ui/breadcrumbs.jsx';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCorrection, setSearchCorrection] = useState('');

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
      .then((res) => {
        setProducts(res.data);
        setSearchCorrection(res.headers.get('x-search-correction') || '');
      })
      .catch(() => {
        setProducts([]);
        setSearchCorrection('');
      })
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
    <div className="page-shell container mx-auto px-4 py-10">
      <SEO
        title="Products"
        description="Shop refrigerators, air conditioners, coolers, water purifiers, and commercial appliances at shradhasales."
        schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }])}
      />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Products' }]} />
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-eyebrow">Catalog</p>
          <h1 className="section-title mt-2">Shop Products</h1>
          <p className="section-copy mt-2">Browse our full product catalog with filters for categories, brands and offers.</p>
        </div>
        <div className="soft-chip px-4 py-2 text-sm font-semibold text-slate-600">{loading ? 'Finding matches…' : `${products.length} products`}</div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="space-y-8">
          <div className="section-panel p-6">
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
          {!loading && q && searchCorrection && products.length > 0 && (
            <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Showing results for <span className="font-semibold text-slate-900">{searchCorrection}</span>
            </div>
          )}
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <EmptyState title={q ? `No products found for "${q}"` : 'No products found'} message="Try clearing a filter or searching a broader appliance name, brand, or model." actionLabel="Clear filters" onAction={() => setSearchParams(new URLSearchParams())} />
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
    <div className="section-panel p-6">
      <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterItem({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} className={`interactive-lift w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${active ? 'border-navy bg-navy/10 font-semibold text-navy shadow-sm' : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-white hover:shadow-sm'}`}>
      {children}
    </button>
  );
}
