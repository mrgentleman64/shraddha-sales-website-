import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, inr } from '../lib/api.js';
import { activeItems, mergeContent } from '../lib/content.js';
import { Button } from '../components/ui/button.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.jsx';
import { ShoppingCart, Zap, ShieldCheck, Truck, Star, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard.jsx';
import ZoomableImage from '../components/ui/ZoomableImage.jsx';
import LazyImage from '../components/ui/LazyImage.jsx';
import SEO, { breadcrumbSchema } from '../components/SEO.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Skeleton } from '../components/ui/skeleton.jsx';
import { Breadcrumbs } from '../components/ui/breadcrumbs.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const { add } = useCart();
  const { user } = useAuth();
  const content = mergeContent(siteContent);
  const reviews = activeItems(content.customer_reviews).filter((review) => !review.product_id || review.product_id === id);

  useEffect(() => {
    if (!id) return;
    setProduct(null);
    api.get(`/products/${id}`).then((res) => {
      setProduct(res.data);
      setActiveImage(0);
      api.get(`/products?category=${res.data.category_id}&limit=8`).then((relatedRes) => setRelated(relatedRes.data.filter((item) => item.id !== id).slice(0, 4)));
    }).catch(() => {});
    api.get(`/comparisons/by-product/${id}`).then((res) => setComparisons(res.data)).catch(() => setComparisons([]));
    api.get('/content').then((res) => setSiteContent(res.data)).catch(() => setSiteContent(null));
  }, [id]);

  const handleAdd = async () => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    await add(product.id, 1);
    toast.success('Added to cart');
  };

  const handleBuy = async () => {
    if (!user) { toast.error('Please login to continue'); return; }
    await add(product.id, 1);
    window.location.href = '/checkout';
  };

  if (!product) {
    return <div className="container mx-auto px-4 py-16"><Skeleton className="h-[520px] w-full rounded-[2rem]" /></div>;
  }

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <SEO
        title={product.name}
        description={product.description || `${product.name} from shradhasales with trusted delivery and checkout.`}
        image={product.images?.[0]}
        type="product"
        schema={[
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }, { name: product.name, path: `/product/${product.id}` }]),
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images || [],
            description: product.description,
            sku: product.model_number,
            brand: { '@type': 'Brand', name: product.brand?.name },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'INR',
              price: product.price,
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          },
        ]}
      />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Products', to: '/products' }, { label: product.name }]} />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="section-panel p-6">
            <div className="grid gap-4">
              <ZoomableImage 
                src={product.images?.[activeImage]} 
                alt={product.name}
                className="max-h-full object-contain w-full"
                containerClassName="rounded-[1.5rem] bg-slate-50 p-8 flex items-center justify-center min-h-[420px]"
              />
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {product.images?.map((src, index) => (
                  <button key={src} type="button" onClick={() => setActiveImage(index)} className={`h-20 w-20 rounded-3xl border ${activeImage === index ? 'border-navy' : 'border-slate-200'} bg-slate-100 p-2 hover:border-navy transition-colors`}> 
                    <LazyImage 
                      src={src} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="h-full w-full object-contain" 
                      containerClassName="w-full h-full relative"
                      showSkeleton={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="section-panel p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-slate-500">
              {product.brand?.logo && <img src={product.brand.logo} alt={product.brand.name} className="h-5 object-contain" />}
              <span>{product.brand?.name}</span>
              <span>·</span>
              <span>{product.category?.name}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 text-amber-500"><Star size={16} />{product.rating?.toFixed(1)}</span>
              <span>Model: {product.model_number}</span>
              <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>
            <div className="mt-6 flex items-end gap-4">
              <div>
                <div className="text-4xl font-bold text-slate-900">{inr(product.price)}</div>
                {product.mrp > product.price && <div className="text-sm text-slate-400 line-through">{inr(product.mrp)}</div>}
              </div>
              <Badge variant="success">{product.discount_percent}% off</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-500">Inclusive of {product.gst_percent}% GST. Delivery in 5-7 business days.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoCard icon={ShieldCheck} title="Warranty" value={product.warranty} />
              <InfoCard icon={Truck} title="Delivery" value={product.delivery_info} />
              <InfoCard icon={Check} title="Availability" value={product.stock > 0 ? 'In stock' : 'Out of stock'} />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleAdd} className="w-full">Add to Cart</Button>
              <Button onClick={handleBuy} variant="solid" className="w-full bg-navy hover:bg-slate-800">Buy Now</Button>
            </div>
          </div>
          <div className="section-panel p-8">
            <Tabs defaultValue="highlights">
              <TabsList>
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                {product.videos?.length ? <TabsTrigger value="videos">Videos</TabsTrigger> : null}
              </TabsList>
              <TabsContent value="highlights">
                <ul className="space-y-3 mt-6">
                  {product.highlights?.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-700"><Check className="mt-1 text-emerald-500" size={18} /> {item}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="specs">
                <div className="mt-6 grid gap-2">
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <div key={key} className="grid gap-2 rounded-3xl bg-slate-50 p-4 text-sm sm:grid-cols-[180px_1fr] sm:gap-3">
                      <div className="text-slate-500">{key}</div>
                      <div className="font-medium text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="description">
                <p className="mt-6 text-slate-700 leading-7">{product.description}</p>
              </TabsContent>
              {product.videos?.length ? (
                <TabsContent value="videos">
                  <div className="mt-6 grid gap-4">
                    {product.videos.map((src, index) => (
                      <video key={src} src={src} controls className="w-full rounded-3xl border border-slate-200 bg-slate-50" aria-label={`Product video ${index + 1}`} />
                    ))}
                  </div>
                </TabsContent>
              ) : null}
            </Tabs>
          </div>
        </div>
      </div>
      {reviews.length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Customer reviews</h2>
            <p className="text-sm text-slate-500">Feedback curated from the admin dashboard.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.slice(0, 6).map((review, index) => (
              <div key={`${review.name}-${index}`} className="section-panel premium-card-hover p-6">
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <Star size={16} />
                  <span>{Number(review.rating || 0).toFixed(1)}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{review.title || review.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{review.comment}</p>
                <p className="mt-5 text-sm font-semibold text-slate-900">{review.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {comparisons.length > 0 && comparisons.map((comparison) => (
        <section key={comparison.id} className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{comparison.name}</h2>
              <p className="text-sm text-slate-500">Compare specifications side by side.</p>
            </div>
            <Link to="/admin" className="text-sm font-semibold text-navy hover:underline">Manage comparisons</Link>
          </div>
          <div className="section-panel overflow-x-auto">
            <table className="premium-table min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-4">Specification</th>
                  {comparison.products.map((item) => (
                    <th key={item.id} className="px-4 py-4 min-w-[240px]"> 
                      <div className="space-y-3">
                        <img src={item.images?.[0]} alt={item.name} className="h-24 w-full object-contain" />
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-slate-500 text-xs">{item.brand?.name}</div>
                        <div className="text-navy font-bold">{inr(item.price)}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(comparison.spec_keys.length ? comparison.spec_keys : Object.keys(comparison.products[0]?.specifications || {})).map((specKey, index) => (
                  <tr key={specKey} className={index % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-4 font-medium text-slate-700">{specKey}</td>
                    {comparison.products.map((item) => (
                      <td key={item.id} className="px-4 py-4 text-slate-900">{item.specifications?.[specKey] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Related products</h2>
              <p className="text-sm text-slate-500">Customers also viewed these items.</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 transition hover:bg-white hover:shadow-sm">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-navy shadow-sm"><Icon size={20} /></div>
      <div className="mt-4 text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}
