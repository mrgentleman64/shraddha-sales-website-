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
  const selectedCategory = categories.find((item) => item.id === category);
  const selectedSubcategory = subcategories.find((item) => item.id === subcategory);
  const selectedBrand = brands.find((item) => item.id === brand);
  const landingName = selectedSubcategory?.name || selectedCategory?.name || selectedBrand?.name || (badge ? `${badge} appliances` : '');
  const canonicalParams = new URLSearchParams();
  if (subcategory) canonicalParams.set('subcategory', subcategory);
  else if (category) canonicalParams.set('category', category);
  else if (brand) canonicalParams.set('brand', brand);
  else if (badge) canonicalParams.set('badge', badge);
  const canonicalPath = canonicalParams.toString() ? `/products?${canonicalParams.toString()}` : '/products';
  const seoTitle = landingName ? `${landingName} Products` : 'Commercial Appliances & Refrigeration Products';
  const seoDescription = landingName
    ? `Shop ${landingName} at Shraddha Sales with genuine brands, GST invoices, clear product specifications, and support for home and commercial buyers.`
    : 'Shop refrigerators, air conditioners, water coolers, visi coolers, deep freezers, bakery equipment, and commercial appliances at Shraddha Sales.';
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    selectedCategory && { name: selectedCategory.name, path: `/products?category=${selectedCategory.id}` },
    selectedSubcategory && { name: selectedSubcategory.name, path: `/products?subcategory=${selectedSubcategory.id}` },
    selectedBrand && { name: selectedBrand.name, path: `/products?brand=${selectedBrand.id}` },
  ].filter(Boolean);
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: seoTitle,
    description: seoDescription,
    url: `https://shradhasales.vercel.app${canonicalPath}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 24).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://shradhasales.vercel.app/product/${product.id}`,
        name: product.name,
      })),
    },
  };

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
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        robots={q ? 'noindex, follow' : 'index, follow'}
        schema={[breadcrumbSchema(breadcrumbItems), collectionSchema]}
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
          {!loading && landingName && (
            <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600">
              <h2 className="text-lg font-semibold text-slate-900">{landingName}</h2>
              <p className="mt-2">
                Explore {landingName} for reliable cooling, storage, display, and appliance needs. Compare brands, capacity, model details,
                pricing, stock status, and specifications before choosing the right fit for your home, shop, office, restaurant, bakery, or commercial space.
              </p>
            </div>
          )}
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
