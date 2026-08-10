import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgePercent, Headphones, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../lib/api.js';
import { activeItems, fallbackContent, firstActive, mergeContent } from '../lib/content.js';
import ProductCard from '../components/ProductCard.jsx';
import LazyImage, { optimizedImageUrl } from '../components/ui/LazyImage.jsx';
import SEO, { organizationSchema } from '../components/SEO.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const content = useMemo(() => mergeContent(siteContent), [siteContent]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get('/products?limit=12'),
      api.get('/categories'),
      api.get('/brands'),
      api.get('/content'),
    ]).then(([productsRes, categoriesRes, brandsRes, contentRes]) => {
      if (!active) return;
      setProducts(productsRes.status === 'fulfilled' ? productsRes.value.data : []);
      setCategories(categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : []);
      setBrands(brandsRes.status === 'fulfilled' ? brandsRes.value.data : []);
      setSiteContent(contentRes.status === 'fulfilled' ? contentRes.value.data : null);
    });
    return () => {
      active = false;
    };
  }, []);

  const hero = firstActive(content.hero_banners) || fallbackContent.hero_banners[0];
  const offerBanner = firstActive(content.sale_banners) || firstActive(content.festival_offers) || firstActive(content.homepage_banners);
  const marketingImages = [
    ...activeItems(content.homepage_banners),
    ...activeItems(content.promotional_images),
    ...activeItems(content.carousel_images),
    ...activeItems(content.festival_offers),
    ...activeItems(content.advertisement_banners),
  ].filter((item) => item.image).slice(0, 3);
  const testimonials = activeItems(content.testimonials).slice(0, 3);
  const acCategory = categories.find((category) => category.name.toLowerCase().includes('air conditioner'));
  const sectionFor = (key, fallback) => activeItems(content.homepage_sections).find((item) => item.key === key) || fallback;
  const categorySection = sectionFor('featured_categories', { title: 'Featured categories', subtitle: 'Shop by category', active: true });
  const featuredSection = sectionFor('featured_products', { title: 'Top picks right now', subtitle: 'Featured products', badge: 'featured', active: true });
  const optionalSections = activeItems(content.homepage_sections).filter((section) => ['best_sellers', 'new_arrivals', 'offers'].includes(section.key));

  const featured = products.filter((p) => p.badges?.includes(featuredSection.badge || 'featured')).slice(0, 4);

  return (
    <div className="page-shell">
      <SEO title="Home" description="Shop trusted commercial and home appliances from shradhasales." schema={organizationSchema()} />
      <section className="container mx-auto px-4 pt-8 sm:pt-12">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-end">
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-slate-950 p-10 text-white shadow-lift">
            {hero?.image ? (
              <picture>
                <source srcSet={optimizedImageUrl(hero.image, 960, 'avif')} type="image/avif" />
                <source srcSet={optimizedImageUrl(hero.image, 960, 'webp')} type="image/webp" />
                <img
                  src={optimizedImageUrl(hero.image, 960)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-25"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            ) : null}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.4),_transparent_25%)]" />
            <div className="absolute bottom-0 right-0 opacity-20 text-slate-800 pointer-events-none" style={{ fontSize: '300px', lineHeight: 1 }}>
              ?
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-sm uppercase tracking-[0.3em] text-amber-200">{hero?.eyebrow || 'Premium cooling solutions'}</span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">{hero?.title}</h1>
              <p className="mt-6 max-w-xl text-slate-200">{hero?.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={hero?.cta_link || '/products'} aria-label={hero?.cta_label || 'Shop products'} className="interactive-lift inline-flex items-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">{hero?.cta_label || 'Shop products'} <ArrowRight className="ml-2" size={16} aria-hidden="true" /></Link>
                <Link to={hero?.secondary_link || '/categories'} className="interactive-lift inline-flex items-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm text-slate-200 transition hover:bg-white/15">{hero?.secondary_label || 'Browse categories'}</Link>
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="section-panel overflow-hidden p-6">
              {offerBanner?.image ? <LazyImage src={offerBanner.image} alt="" className="mb-5 h-32 w-full rounded-3xl object-cover" loading="lazy" sizes="(min-width: 1024px) 33vw, 100vw" /> : null}
              <h2 className="font-semibold text-lg text-slate-900">{offerBanner?.title || 'Summer offers'}</h2>
              <p className="mt-3 text-sm text-slate-600">{offerBanner?.subtitle || 'Explore inverter ACs and cooling systems with special discounts.'}</p>
              <div className="mt-6 grid gap-3">
                <Link to={offerBanner?.link || '/products?badge=offer'} className="interactive-lift rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-700 transition hover:bg-white hover:shadow-sm">{offerBanner?.cta_label || 'View latest offers'}</Link>
                <Link to={acCategory ? `/products?category=${acCategory.id}` : '/products?q=AC'} className="interactive-lift rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-700 transition hover:bg-white hover:shadow-sm">Shop ACs</Link>
              </div>
            </div>
            <div className="section-panel overflow-hidden p-6">
              <h2 className="font-semibold text-lg text-slate-900">Trusted brands</h2>
              <p className="mt-3 text-sm text-slate-600">Our catalog includes Blue Star, LG, Samsung, Whirlpool and more.</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {brands.slice(0, 6).map((brand) => (
                  <div key={brand.id} className="interactive-lift flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-3 transition hover:bg-white hover:shadow-sm">
                    {brand.logo ? <img src={brand.logo} alt={brand.name} width="96" height="40" className="max-h-8 object-contain" loading="lazy" decoding="async" /> : <span className="text-sm text-slate-700">{brand.name}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {marketingImages.length > 0 && (
        <section className="container mx-auto px-4 mt-12">
          <div className="grid gap-5 md:grid-cols-3">
            {marketingImages.map((item, index) => (
              <Link key={`${item.image}-${index}`} to={item.link || '/products'} className="group section-panel premium-card-hover overflow-hidden">
                <LazyImage src={item.image} alt={item.title || 'Promotion'} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 768px) 33vw, 100vw" />
                {(item.title || item.subtitle) && (
                  <div className="p-5">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.subtitle}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {categorySection.active !== false && (
        <section className="container mx-auto px-4 mt-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-amber-700">{categorySection.subtitle}</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{categorySection.title}</h2>
            </div>
            <Link to="/categories" className="text-sm font-semibold text-navy hover:underline">View all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`} className="group section-panel premium-card-hover overflow-hidden">
                <div className="h-28 overflow-hidden bg-slate-100 relative">
                  <LazyImage
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105 w-full"
                    containerClassName="w-full h-full relative"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="font-semibold text-slate-900">{category.name}</p>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredSection.active !== false && (
        <ProductSection title={featuredSection.title} subtitle={featuredSection.subtitle} products={featured} />
      )}

      {optionalSections.map((section) => {
        const badge = section.badge || (section.key === 'best_sellers' ? 'bestseller' : section.key === 'new_arrivals' ? 'new' : 'offer');
        const sectionProducts = products.filter((product) => product.badges?.includes(badge)).slice(0, 4);
        return <ProductSection key={section.key} title={section.title || section.key} subtitle={section.subtitle || badge} products={sectionProducts} />;
      })}

      <section className="container mx-auto px-4 mt-16">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Authorized dealer', subtitle: 'Genuine warranty & invoices' },
            { icon: Truck, title: 'Fast delivery', subtitle: 'Pan-India shipping' },
            { icon: BadgePercent, title: 'Best pricing', subtitle: 'Offers updated daily' },
            { icon: Headphones, title: 'Support team', subtitle: 'Email & phone support' },
          ].map((item) => (
            <div key={item.title} className="section-panel premium-card-hover p-6 text-center">
              <item.icon size={32} className="mx-auto text-navy" />
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="container mx-auto px-4 mt-16">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-amber-700">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">What customers say</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <div key={`${item.name}-${index}`} className="section-panel premium-card-hover p-6">
                <p className="text-sm leading-7 text-slate-600">{item.message}</p>
                <div className="mt-6 flex items-center gap-3">
                  {item.image ? <LazyImage src={item.image} alt={item.name} className="h-11 w-11 rounded-full object-cover" sizes="44px" widths={[88]} /> : <div className="h-11 w-11 rounded-full bg-slate-100" />}
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 mt-20 pb-12">
        <div className="overflow-hidden rounded-[2rem] bg-navy px-8 py-14 text-white shadow-lift">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { value: '15+', label: 'Years of trust' },
              { value: '10,000+', label: 'Happy customers' },
              { value: '300+', label: 'Products in catalog' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-4xl font-extrabold">{item.value}</p>
                <p className="mt-2 text-sm text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductSection({ title, subtitle, products }) {
  if (!products.length) return null;
  return (
    <section className="container mx-auto px-4 mt-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-amber-700">{subtitle}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
        </div>
        <Link to="/products" className="text-sm font-semibold text-navy hover:underline">View all products</Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

