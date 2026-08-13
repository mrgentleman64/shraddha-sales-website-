import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BadgePercent,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Edit3,
  Eye,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Package,
  Palette,
  Plus,
  Save,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, fmtError, inr } from '../lib/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';

const tabs = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'taxonomy', label: 'Categories', icon: Tags },
  { key: 'content', label: 'Content', icon: ImageIcon },
  { key: 'media', label: 'Media', icon: Upload },
  { key: 'orders', label: 'Orders', icon: ClipboardList },
];

const blankContent = {
  branding: {
    site_name: 'shradhasales',
    tagline: 'Cooling · Kitchen · Bakery',
    company_logo: '',
    website_logo: '',
    footer_logo: '',
    favicon: '',
  },
  hero_banners: [],
  homepage_banners: [],
  promotional_images: [],
  carousel_images: [],
  festival_offers: [],
  sale_banners: [],
  advertisement_banners: [],
  homepage_sections: [],
  testimonials: [],
  customer_reviews: [],
  contact: {
    phone: '+91 98765 43210',
    email: 'support@shradhasales.com',
    address: '122 Commerce Avenue, Mumbai, India',
    locations: 'Mumbai · Delhi · Pune',
    working_hours: 'Mon - Sat, 9:00 AM - 7:00 PM',
  },
  social_links: {
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
  },
  footer: {
    description: 'Premium appliances for home and commercial cooling, kitchen and bakery solutions.',
    copyright: 'shradhasales. All rights reserved.',
    shop_links_title: 'Shop',
    customer_links_title: 'Customer',
  },
  coupons: [],
  seo: {
    title: 'shradhasales',
    description: 'Premium appliances for home and commercial cooling, kitchen and bakery solutions.',
    keywords: 'appliances, refrigerators, air conditioners, coolers, bakery equipment',
  },
  theme: {
    primary_color: '#1e3a8a',
    accent_color: '#f59e0b',
    body_font: 'Manrope',
    heading_font: 'Outfit',
  },
  website_settings: {
    announcement: 'COD available · GST invoice',
    cod_enabled: true,
    gst_invoice_enabled: true,
  },
};

const marketingFields = [
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
  { key: 'image', label: 'Image', type: 'image' },
  { key: 'cta_label', label: 'Button label' },
  { key: 'link', label: 'Link' },
  { key: 'active', label: 'Active', type: 'checkbox' },
  { key: 'sort_order', label: 'Order', type: 'number' },
];

const contentGroups = [
  {
    title: 'Hero banners',
    key: 'hero_banners',
    icon: ImageIcon,
    fields: [
      { key: 'eyebrow', label: 'Eyebrow' },
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'cta_label', label: 'Primary label' },
      { key: 'cta_link', label: 'Primary link' },
      { key: 'secondary_label', label: 'Secondary label' },
      { key: 'secondary_link', label: 'Secondary link' },
      { key: 'active', label: 'Active', type: 'checkbox' },
      { key: 'sort_order', label: 'Order', type: 'number' },
    ],
    defaults: {
      eyebrow: 'Premium cooling solutions',
      title: '',
      subtitle: '',
      image: '',
      cta_label: 'Shop products',
      cta_link: '/products',
      secondary_label: 'Browse categories',
      secondary_link: '/categories',
      active: true,
      sort_order: 0,
    },
  },
  { title: 'Homepage banners', key: 'homepage_banners', icon: ImageIcon, fields: marketingFields },
  { title: 'Promotional images', key: 'promotional_images', icon: BadgePercent, fields: marketingFields },
  { title: 'Carousel images', key: 'carousel_images', icon: ImageIcon, fields: marketingFields },
  { title: 'Festival offers', key: 'festival_offers', icon: BadgePercent, fields: marketingFields },
  { title: 'Sale banners', key: 'sale_banners', icon: BadgePercent, fields: marketingFields },
  { title: 'Advertisement banners', key: 'advertisement_banners', icon: ImageIcon, fields: marketingFields },
  {
    title: 'Homepage sections',
    key: 'homepage_sections',
    icon: Layers,
    fields: [
      { key: 'key', label: 'Section key' },
      { key: 'subtitle', label: 'Small heading' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'badge', label: 'Product badge' },
      { key: 'active', label: 'Active', type: 'checkbox' },
      { key: 'sort_order', label: 'Order', type: 'number' },
    ],
    defaults: { key: '', subtitle: '', title: '', type: 'product_grid', badge: 'featured', active: true, sort_order: 0 },
  },
  {
    title: 'Testimonials',
    key: 'testimonials',
    icon: MessageSquare,
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'message', label: 'Message', type: 'textarea' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'active', label: 'Active', type: 'checkbox' },
      { key: 'sort_order', label: 'Order', type: 'number' },
    ],
    defaults: { name: '', role: '', message: '', rating: 5, image: '', active: true, sort_order: 0 },
  },
  {
    title: 'Customer reviews',
    key: 'customer_reviews',
    icon: Star,
    fields: [
      { key: 'product_id', label: 'Product', type: 'product' },
      { key: 'name', label: 'Customer' },
      { key: 'title', label: 'Title' },
      { key: 'comment', label: 'Comment', type: 'textarea' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
      { key: 'sort_order', label: 'Order', type: 'number' },
    ],
    defaults: { product_id: '', name: '', title: '', comment: '', rating: 5, active: true, sort_order: 0 },
  },
  {
    title: 'Coupons',
    key: 'coupons',
    icon: BadgePercent,
    fields: [
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
      { key: 'discount_type', label: 'Type', type: 'select', options: ['percent', 'fixed'] },
      { key: 'discount_value', label: 'Value', type: 'number' },
      { key: 'starts_at', label: 'Starts at' },
      { key: 'expires_at', label: 'Expires at' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
    defaults: { code: '', description: '', discount_type: 'percent', discount_value: 0, starts_at: '', expires_at: '', active: true },
  },
];

function authHeaders() {
  const token = localStorage.getItem('ss_token');
  return { Authorization: `Bearer ${token}` };
}

function mergeContent(content) {
  const merged = { ...blankContent, ...(content || {}) };
  for (const key of ['branding', 'contact', 'social_links', 'footer', 'seo', 'theme', 'website_settings']) {
    merged[key] = { ...blankContent[key], ...((content || {})[key] || {}) };
  }
  for (const group of contentGroups) {
    merged[group.key] = Array.isArray(merged[group.key]) ? merged[group.key] : [];
  }
  return merged;
}

function blankProduct(categories = [], brands = []) {
  return {
    id: '',
    name: '',
    sku: '',
    model_number: '',
    brand_id: brands[0]?.id || '',
    category_id: categories[0]?.id || '',
    subcategory_id: '',
    description: '',
    highlightsText: '',
    images: [],
    videos: [],
    price: '',
    mrp: '',
    discount_percent: 0,
    gst_percent: 18,
    stock: 0,
    warranty: '1 Year Manufacturer Warranty',
    delivery_info: 'Delivered in 5-7 business days',
    specificationsText: '',
    rating: 4.2,
    visible: true,
    featured: false,
    bestseller: false,
    new_arrival: false,
    offer: false,
  };
}

function productToForm(product) {
  const badges = product.badges || [];
  return {
    id: product.id || '',
    name: product.name || '',
    sku: product.sku || product.model_number || '',
    model_number: product.model_number || '',
    brand_id: product.brand_id || '',
    category_id: product.category_id || '',
    subcategory_id: product.subcategory_id || '',
    description: product.description || '',
    highlightsText: (product.highlights || []).join('\n'),
    images: product.images || [],
    videos: product.videos || [],
    price: product.price ?? '',
    mrp: product.mrp ?? '',
    discount_percent: product.discount_percent ?? 0,
    gst_percent: product.gst_percent ?? 18,
    stock: product.stock ?? 0,
    warranty: product.warranty || '',
    delivery_info: product.delivery_info || '',
    specificationsText: Object.entries(product.specifications || {}).map(([key, value]) => `${key}: ${value}`).join('\n'),
    rating: product.rating ?? 4.2,
    visible: product.visible !== false,
    featured: product.featured ?? badges.includes('featured'),
    bestseller: product.bestseller ?? badges.includes('bestseller'),
    new_arrival: product.new_arrival ?? badges.includes('new'),
    offer: product.offer ?? badges.includes('offer'),
  };
}

function productPayload(form) {
  const badges = [
    form.offer && 'offer',
    form.featured && 'featured',
    form.bestseller && 'bestseller',
    form.new_arrival && 'new',
  ].filter(Boolean);

  return {
    name: form.name.trim(),
    sku: form.sku.trim(),
    model_number: form.model_number.trim(),
    brand_id: form.brand_id,
    category_id: form.category_id,
    subcategory_id: form.subcategory_id,
    description: form.description,
    highlights: lines(form.highlightsText),
    images: form.images,
    videos: form.videos,
    price: Number(form.price || 0),
    mrp: Number(form.mrp || form.price || 0),
    discount_percent: Number(form.discount_percent || 0),
    gst_percent: Number(form.gst_percent || 0),
    stock: Number(form.stock || 0),
    warranty: form.warranty,
    delivery_info: form.delivery_info,
    specifications: specsFromText(form.specificationsText),
    rating: Number(form.rating || 0),
    badges,
    featured: form.featured,
    bestseller: form.bestseller,
    new_arrival: form.new_arrival,
    offer: form.offer,
    visible: form.visible,
  };
}

function lines(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function specsFromText(value) {
  return lines(value).reduce((acc, line) => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) acc[key.trim()] = rest.join(':').trim();
    return acc;
  }, {});
}

function blankCategory() {
  return { id: '', name: '', slug: '', image: '', description: '', visible: true, order: 0 };
}

function blankSubcategory(categories = []) {
  return { id: '', name: '', category_id: categories[0]?.id || '', slug: '', image: '', description: '', visible: true, order: 0 };
}

function blankBrand() {
  return { id: '', name: '', slug: '', logo: '', description: '', visible: true };
}

function clientId() {
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const unavailable = (value) => {
  if (value === 0) return 0;
  if (value === false) return 'No';
  return value || 'Not available';
};

const moneyOrUnavailable = (value) => (value === undefined || value === null || value === '' ? 'Not available' : inr(value));

const formatDateTime = (value) => {
  if (!value) return { date: 'Not available', time: 'Not available' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: 'Not available', time: 'Not available' };
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};

const addressLines = (address = {}) => [
  address.full_name,
  address.address,
  [address.city, address.district].filter(Boolean).join(', '),
  [address.state, address.pin_code || address.zip || address.zip_code].filter(Boolean).join(' - '),
  address.country,
  address.landmark && `Landmark: ${address.landmark}`,
  address.phone && `Phone: ${address.phone}`,
].filter(Boolean);

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [media, setMedia] = useState([]);
  const [content, setContent] = useState(blankContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderInfoLoading, setOrderInfoLoading] = useState(false);
  const [orderInfoError, setOrderInfoError] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productForm, setProductForm] = useState(blankProduct());
  const [categoryForm, setCategoryForm] = useState(blankCategory());
  const [subcategoryForm, setSubcategoryForm] = useState(blankSubcategory());
  const [brandForm, setBrandForm] = useState(blankBrand());

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = authHeaders();
      const [statsRes, ordersRes, productsRes, categoriesRes, brandsRes, subcategoriesRes, contentRes, mediaRes] = await Promise.all([
        api.get('/admin/stats', { headers }),
        api.get('/admin/orders', { headers }),
        api.get('/admin/products', { headers }),
        api.get('/admin/categories', { headers }),
        api.get('/admin/brands', { headers }),
        api.get('/admin/subcategories', { headers }),
        api.get('/admin/content', { headers }),
        api.get('/admin/media', { headers }),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
      setSubcategories(subcategoriesRes.data);
      setContent(mergeContent(contentRes.data));
      setMedia(mediaRes.data);
      setProductForm((current) => current.id || current.name ? current : blankProduct(categoriesRes.data, brandsRes.data));
      setSubcategoryForm((current) => current.id || current.name ? current : blankSubcategory(categoriesRes.data));
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail) || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [user, navigate]);

  const visibleProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => [product.name, product.sku, product.model_number, product.brand?.name, product.category?.name].filter(Boolean).some((value) => String(value).toLowerCase().includes(q)));
  }, [products, productSearch]);

  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((item) => item.category_id === productForm.category_id);
  }, [subcategories, productForm.category_id]);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/uploads', formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    setMedia((current) => [response.data, ...current]);
    return response.data;
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!productForm.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!productForm.brand_id || !productForm.category_id) {
      toast.error('Select a brand and category');
      return;
    }

    setSaving(true);
    try {
      const payload = productPayload(productForm);
      if (productForm.id) await api.put(`/admin/products/${productForm.id}`, payload, { headers: authHeaders() });
      else await api.post('/admin/products', payload, { headers: authHeaders() });
      toast.success('Product saved');
      setProductForm(blankProduct(categories, brands));
      await loadAdminData();
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    await api.delete(`/admin/products/${product.id}`, { headers: authHeaders() });
    toast.success('Product deleted');
    if (productForm.id === product.id) setProductForm(blankProduct(categories, brands));
    await loadAdminData();
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      const payload = { ...categoryForm, order: Number(categoryForm.order || 0) };
      delete payload.id;
      if (categoryForm.id) await api.put(`/admin/categories/${categoryForm.id}`, payload, { headers: authHeaders() });
      else await api.post('/admin/categories', payload, { headers: authHeaders() });
      toast.success('Category saved');
      setCategoryForm(blankCategory());
      await loadAdminData();
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const saveSubcategory = async (event) => {
    event.preventDefault();
    if (!subcategoryForm.name.trim()) return toast.error('Subcategory name is required');
    if (!subcategoryForm.category_id) return toast.error('Select a parent category');
    setSaving(true);
    try {
      const payload = { ...subcategoryForm, order: Number(subcategoryForm.order || 0) };
      delete payload.id;
      if (subcategoryForm.id) await api.put(`/admin/subcategories/${subcategoryForm.id}`, payload, { headers: authHeaders() });
      else await api.post('/admin/subcategories', payload, { headers: authHeaders() });
      toast.success('Subcategory saved');
      setSubcategoryForm(blankSubcategory(categories));
      await loadAdminData();
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const saveBrand = async (event) => {
    event.preventDefault();
    if (!brandForm.name.trim()) return toast.error('Brand name is required');
    setSaving(true);
    try {
      const payload = { ...brandForm };
      delete payload.id;
      if (brandForm.id) await api.put(`/admin/brands/${brandForm.id}`, payload, { headers: authHeaders() });
      else await api.post('/admin/brands', payload, { headers: authHeaders() });
      toast.success('Brand saved');
      setBrandForm(blankBrand());
      await loadAdminData();
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const removeTaxonomy = async (type, item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    await api.delete(`/admin/${type}/${item.id}`, { headers: authHeaders() });
    toast.success('Deleted');
    await loadAdminData();
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const response = await api.put('/admin/content', content, { headers: authHeaders() });
      setContent(mergeContent(response.data));
      toast.success('Website content saved');
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (orderId, nextStatus) => {
    setStatusBusy(orderId);
    try {
      await api.put(`/admin/orders/${orderId}?status=${encodeURIComponent(nextStatus)}`, null, { headers: authHeaders() });
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
      setOrderInfo((current) => (current?.id === orderId ? { ...current, status: nextStatus } : current));
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setStatusBusy(null);
    }
  };

  const openOrderInfo = async (orderId) => {
    setOrderInfo(null);
    setOrderInfoError('');
    setOrderInfoLoading(true);
    try {
      const response = await api.get(`/admin/orders/${encodeURIComponent(orderId)}`, { headers: authHeaders() });
      setOrderInfo(response.data);
    } catch (error) {
      setOrderInfoError(fmtError(error.response?.data?.detail) || 'Failed to load order');
    } finally {
      setOrderInfoLoading(false);
    }
  };

  const deleteMedia = async (item) => {
    if (!window.confirm(`Delete ${item.original_name || item.filename}?`)) return;
    await api.delete(`/admin/uploads/${encodeURIComponent(item.filename)}`, { headers: authHeaders() });
    setMedia((current) => current.filter((entry) => entry.filename !== item.filename));
    toast.success('Media deleted');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Admin access required</h1>
        <p className="mt-3 text-slate-500">Login with an admin account to view the dashboard.</p>
        <Button onClick={() => navigate('/login')} className="mt-6">Login</Button>
      </div>
    );
  }

  return (
    <div className="page-shell container mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Manage catalog, media, content, settings, and orders from one secure panel.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/products')}>Catalog</Button>
          <Button variant="outline" onClick={() => loadAdminData()} disabled={loading}>Refresh</Button>
        </div>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading admin data...</div>}

      {!loading && activeTab === 'overview' && (
        <OverviewPanel stats={stats} products={products} orders={orders.slice(0, 8)} updateStatus={updateStatus} statusBusy={statusBusy} onViewOrder={openOrderInfo} />
      )}

      {!loading && activeTab === 'products' && (
        <ProductsPanel
          products={visibleProducts}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          productForm={productForm}
          setProductForm={setProductForm}
          saveProduct={saveProduct}
          deleteProduct={deleteProduct}
          categories={categories}
          subcategories={filteredSubcategories}
          brands={brands}
          saving={saving}
          uploadFile={uploadFile}
          resetForm={() => setProductForm(blankProduct(categories, brands))}
        />
      )}

      {!loading && activeTab === 'taxonomy' && (
        <TaxonomyPanel
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          categoryForm={categoryForm}
          setCategoryForm={setCategoryForm}
          subcategoryForm={subcategoryForm}
          setSubcategoryForm={setSubcategoryForm}
          brandForm={brandForm}
          setBrandForm={setBrandForm}
          saveCategory={saveCategory}
          saveSubcategory={saveSubcategory}
          saveBrand={saveBrand}
          removeTaxonomy={removeTaxonomy}
          uploadFile={uploadFile}
          saving={saving}
        />
      )}

      {!loading && activeTab === 'content' && (
        <ContentPanel content={content} setContent={setContent} products={products} uploadFile={uploadFile} saveContent={saveContent} saving={saving} />
      )}

      {!loading && activeTab === 'media' && (
        <MediaPanel media={media} uploadFile={uploadFile} deleteMedia={deleteMedia} />
      )}

      {!loading && activeTab === 'orders' && (
        <OrdersPanel orders={orders} updateStatus={updateStatus} statusBusy={statusBusy} onViewOrder={openOrderInfo} />
      )}

      {(orderInfoLoading || orderInfo || orderInfoError) && (
        <OrderInfoModal
          order={orderInfo}
          loading={orderInfoLoading}
          error={orderInfoError}
          onClose={() => {
            setOrderInfo(null);
            setOrderInfoError('');
            setOrderInfoLoading(false);
          }}
        />
      )}
    </div>
  );
}

function OverviewPanel({ stats, products, orders, updateStatus, statusBusy, onViewOrder }) {
  const lowStock = products.filter((product) => Number(product.stock || 0) <= 5).slice(0, 8);
  return (
    <>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Products" value={stats?.total_products ?? '-'} />
        <StatCard icon={ClipboardList} label="Orders" value={stats?.total_orders ?? '-'} />
        <StatCard icon={Users} label="Customers" value={stats?.customers ?? '-'} />
        <StatCard icon={AlertTriangle} label="Pending" value={stats?.pending_orders ?? '-'} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="section-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Revenue trend</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Weekly sales</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"><BarChart3 size={16} /> Revenue</div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.series || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={50} />
                <Tooltip formatter={(value) => inr(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#1e3a8a" fill="url(#revenueGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="section-panel p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Inventory alert</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Low stock products</h2>
          <div className="mt-6 space-y-4">
            {lowStock.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">No low stock alerts.</div>
            ) : (
              lowStock.map((product) => (
                <div key={product.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span>{product.name}</span>
                    <span className="font-semibold text-slate-900">{product.stock} left</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 section-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-900">Recent orders</h2>
          <span className="text-sm text-slate-500">Latest 8 orders</span>
        </div>
        <OrdersTable orders={orders} updateStatus={updateStatus} statusBusy={statusBusy} onViewOrder={onViewOrder} />
      </div>
    </>
  );
}

function ProductsPanel({ products, productSearch, setProductSearch, productForm, setProductForm, saveProduct, deleteProduct, categories, subcategories, brands, saving, uploadFile, resetForm }) {
  const update = (key, value) => setProductForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
      <div className="section-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Product catalog</h2>
            <p className="mt-1 text-sm text-slate-500">{products.length} products shown</p>
          </div>
          <Button size="sm" onClick={resetForm}><Plus size={16} className="mr-2" />New</Button>
        </div>
        <Input className="mt-5" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products, SKU, brand..." />
        <div className="mt-5 max-h-[760px] space-y-3 overflow-y-auto pr-1">
          {products.map((product) => (
            <div key={product.id} className={`rounded-3xl border p-4 transition ${productForm.id === product.id ? 'border-navy bg-blue-50/40' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex gap-3">
                <img src={product.images?.[0]} alt={product.name} className="h-16 w-16 rounded-2xl bg-white object-contain p-2" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.brand?.name || 'No brand'} · {product.category?.name || 'No category'}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700">{inr(product.price)}</span>
                    <span className="rounded-full bg-white px-2 py-1 text-slate-700">{product.stock} stock</span>
                    {product.visible === false && <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700">Hidden</span>}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setProductForm(productToForm(product))}><Edit3 size={14} className="mr-2" />Edit</Button>
                <Button size="sm" variant="outline" onClick={() => deleteProduct(product)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
          {products.length === 0 && <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">No products found.</div>}
        </div>
      </div>

      <form onSubmit={saveProduct} className="section-panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{productForm.id ? 'Edit product' : 'Add product'}</h2>
            <p className="mt-1 text-sm text-slate-500">Manage details, stock, flags, images, videos, warranty, and specifications.</p>
          </div>
          <Button type="submit" disabled={saving}><Save size={16} className="mr-2" />Save</Button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Name"><Input value={productForm.name} onChange={(event) => update('name', event.target.value)} required /></Field>
          <Field label="SKU"><Input value={productForm.sku} onChange={(event) => update('sku', event.target.value)} placeholder="Internal stock code" /></Field>
          <Field label="Model number"><Input value={productForm.model_number} onChange={(event) => update('model_number', event.target.value)} /></Field>
          <Field label="Brand">
            <Select value={productForm.brand_id} onChange={(event) => update('brand_id', event.target.value)}>
              <option value="">Select brand</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </Select>
          </Field>
          <Field label="Category">
            <Select value={productForm.category_id} onChange={(event) => update('category_id', event.target.value)}>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </Field>
          <Field label="Subcategory">
            <Select value={productForm.subcategory_id} onChange={(event) => update('subcategory_id', event.target.value)}>
              <option value="">No subcategory</option>
              {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
            </Select>
          </Field>
          <Field label="Price"><Input type="number" value={productForm.price} onChange={(event) => update('price', event.target.value)} min="0" step="0.01" required /></Field>
          <Field label="MRP"><Input type="number" value={productForm.mrp} onChange={(event) => update('mrp', event.target.value)} min="0" step="0.01" required /></Field>
          <Field label="Discount %"><Input type="number" value={productForm.discount_percent} onChange={(event) => update('discount_percent', event.target.value)} min="0" step="0.01" /></Field>
          <Field label="GST %"><Input type="number" value={productForm.gst_percent} onChange={(event) => update('gst_percent', event.target.value)} min="0" step="0.01" /></Field>
          <Field label="Stock"><Input type="number" value={productForm.stock} onChange={(event) => update('stock', event.target.value)} min="0" step="1" /></Field>
          <Field label="Rating"><Input type="number" value={productForm.rating} onChange={(event) => update('rating', event.target.value)} min="0" max="5" step="0.1" /></Field>
          <Field label="Warranty"><Input value={productForm.warranty} onChange={(event) => update('warranty', event.target.value)} /></Field>
          <Field label="Delivery info"><Input value={productForm.delivery_info} onChange={(event) => update('delivery_info', event.target.value)} /></Field>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <CheckField checked={productForm.visible} onChange={(value) => update('visible', value)} label="Visible" />
          <CheckField checked={productForm.featured} onChange={(value) => update('featured', value)} label="Featured" />
          <CheckField checked={productForm.bestseller} onChange={(value) => update('bestseller', value)} label="Bestseller" />
          <CheckField checked={productForm.new_arrival} onChange={(value) => update('new_arrival', value)} label="New arrival" />
          <CheckField checked={productForm.offer} onChange={(value) => update('offer', value)} label="Offer" />
        </div>

        <div className="mt-6 grid gap-6">
          <MediaList label="Product images" values={productForm.images} onChange={(values) => update('images', values)} uploadFile={uploadFile} accept="image/png,image/jpeg,image/webp,image/gif" preview />
          <MediaList label="Product videos" values={productForm.videos} onChange={(values) => update('videos', values)} uploadFile={uploadFile} accept="video/mp4,video/webm" />
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Highlights">
            <Textarea value={productForm.highlightsText} onChange={(event) => update('highlightsText', event.target.value)} placeholder="One highlight per line" rows={8} />
          </Field>
          <Field label="Specifications">
            <Textarea value={productForm.specificationsText} onChange={(event) => update('specificationsText', event.target.value)} placeholder="Capacity: 320 L" rows={8} />
          </Field>
        </div>
        <Field label="Description" className="mt-5">
          <Textarea value={productForm.description} onChange={(event) => update('description', event.target.value)} rows={5} />
        </Field>
      </form>
    </div>
  );
}

function TaxonomyPanel({ categories, subcategories, brands, categoryForm, setCategoryForm, subcategoryForm, setSubcategoryForm, brandForm, setBrandForm, saveCategory, saveSubcategory, saveBrand, removeTaxonomy, uploadFile, saving }) {
  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-3">
      <TaxonomyEditor
        title="Categories"
        items={categories}
        form={categoryForm}
        setForm={setCategoryForm}
        blank={blankCategory}
        onSubmit={saveCategory}
        onDelete={(item) => removeTaxonomy('categories', item)}
        uploadFile={uploadFile}
        saving={saving}
        imageField="image"
      />
      <SubcategoryEditor
        categories={categories}
        subcategories={subcategories}
        form={subcategoryForm}
        setForm={setSubcategoryForm}
        onSubmit={saveSubcategory}
        onDelete={(item) => removeTaxonomy('subcategories', item)}
        uploadFile={uploadFile}
        saving={saving}
      />
      <TaxonomyEditor
        title="Brands"
        items={brands}
        form={brandForm}
        setForm={setBrandForm}
        blank={blankBrand}
        onSubmit={saveBrand}
        onDelete={(item) => removeTaxonomy('brands', item)}
        uploadFile={uploadFile}
        saving={saving}
        imageField="logo"
      />
    </div>
  );
}

function TaxonomyEditor({ title, items, form, setForm, blank, onSubmit, onDelete, uploadFile, saving, imageField }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="section-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <Button size="sm" variant="outline" onClick={() => setForm(blank())}><Plus size={14} className="mr-2" />New</Button>
      </div>
      <div className="mt-5 max-h-60 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
            <span className="min-w-0 truncate font-medium text-slate-800">{item.name}</span>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-navy" onClick={() => setForm(item)}><Edit3 size={14} /></button>
              <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-red-600" onClick={() => onDelete(item)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Name"><Input value={form.name} onChange={(event) => update('name', event.target.value)} required /></Field>
        <Field label="Slug"><Input value={form.slug || ''} onChange={(event) => update('slug', event.target.value)} placeholder="Auto-generated if blank" /></Field>
        <SingleMediaInput label={imageField === 'logo' ? 'Logo' : 'Image'} value={form[imageField] || ''} onChange={(value) => update(imageField, value)} uploadFile={uploadFile} />
        <Field label="Description"><Textarea value={form.description || ''} onChange={(event) => update('description', event.target.value)} rows={4} /></Field>
        {imageField === 'image' && <Field label="Order"><Input type="number" value={form.order || 0} onChange={(event) => update('order', event.target.value)} /></Field>}
        <CheckField checked={form.visible !== false} onChange={(value) => update('visible', value)} label="Visible" />
        <Button type="submit" disabled={saving} className="w-full"><Save size={16} className="mr-2" />Save {title.slice(0, -1)}</Button>
      </form>
    </div>
  );
}

function SubcategoryEditor({ categories, subcategories, form, setForm, onSubmit, onDelete, uploadFile, saving }) {
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="section-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Subcategories</h2>
        <Button size="sm" variant="outline" onClick={() => setForm(blankSubcategory(categories))}><Plus size={14} className="mr-2" />New</Button>
      </div>
      <div className="mt-5 max-h-60 space-y-2 overflow-y-auto">
        {subcategories.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">{item.name}</p>
              <p className="truncate text-xs text-slate-500">{categories.find((category) => category.id === item.category_id)?.name || 'No parent'}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-navy" onClick={() => setForm(item)}><Edit3 size={14} /></button>
              <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-red-600" onClick={() => onDelete(item)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Name"><Input value={form.name} onChange={(event) => update('name', event.target.value)} required /></Field>
        <Field label="Parent category">
          <Select value={form.category_id} onChange={(event) => update('category_id', event.target.value)} required>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
        </Field>
        <Field label="Slug"><Input value={form.slug || ''} onChange={(event) => update('slug', event.target.value)} placeholder="Auto-generated if blank" /></Field>
        <SingleMediaInput label="Image" value={form.image || ''} onChange={(value) => update('image', value)} uploadFile={uploadFile} />
        <Field label="Description"><Textarea value={form.description || ''} onChange={(event) => update('description', event.target.value)} rows={4} /></Field>
        <Field label="Order"><Input type="number" value={form.order || 0} onChange={(event) => update('order', event.target.value)} /></Field>
        <CheckField checked={form.visible !== false} onChange={(value) => update('visible', value)} label="Visible" />
        <Button type="submit" disabled={saving} className="w-full"><Save size={16} className="mr-2" />Save Subcategory</Button>
      </form>
    </div>
  );
}

function ContentPanel({ content, setContent, products, uploadFile, saveContent, saving }) {
  const updateSection = (section, key, value) => {
    setContent((current) => ({ ...current, [section]: { ...(current[section] || {}), [key]: value } }));
  };
  const updateList = (key, items) => {
    setContent((current) => ({ ...current, [key]: items }));
  };

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-col gap-4 section-panel p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Website content and settings</h2>
          <p className="mt-1 text-sm text-slate-500">Edit logos, banners, offers, footer, SEO, theme, reviews, coupons, and contact information.</p>
        </div>
        <Button onClick={saveContent} disabled={saving}><Save size={16} className="mr-2" />Save content</Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SettingsCard title="Branding" icon={Package}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Website name"><Input value={content.branding.site_name || ''} onChange={(event) => updateSection('branding', 'site_name', event.target.value)} /></Field>
            <Field label="Tagline"><Input value={content.branding.tagline || ''} onChange={(event) => updateSection('branding', 'tagline', event.target.value)} /></Field>
            <SingleMediaInput label="Website logo" value={content.branding.website_logo || ''} onChange={(value) => updateSection('branding', 'website_logo', value)} uploadFile={uploadFile} />
            <SingleMediaInput label="Company logo" value={content.branding.company_logo || ''} onChange={(value) => updateSection('branding', 'company_logo', value)} uploadFile={uploadFile} />
            <SingleMediaInput label="Footer logo" value={content.branding.footer_logo || ''} onChange={(value) => updateSection('branding', 'footer_logo', value)} uploadFile={uploadFile} />
            <SingleMediaInput label="Favicon" value={content.branding.favicon || ''} onChange={(value) => updateSection('branding', 'favicon', value)} uploadFile={uploadFile} />
          </div>
        </SettingsCard>

        <SettingsCard title="Contact and social" icon={LinkIcon}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Phone"><Input value={content.contact.phone || ''} onChange={(event) => updateSection('contact', 'phone', event.target.value)} /></Field>
            <Field label="Email"><Input value={content.contact.email || ''} onChange={(event) => updateSection('contact', 'email', event.target.value)} /></Field>
            <Field label="Address"><Input value={content.contact.address || ''} onChange={(event) => updateSection('contact', 'address', event.target.value)} /></Field>
            <Field label="Locations"><Input value={content.contact.locations || ''} onChange={(event) => updateSection('contact', 'locations', event.target.value)} /></Field>
            <Field label="Working hours"><Input value={content.contact.working_hours || ''} onChange={(event) => updateSection('contact', 'working_hours', event.target.value)} /></Field>
            {['instagram', 'facebook', 'linkedin', 'youtube', 'whatsapp'].map((key) => (
              <Field key={key} label={key}>
                <Input value={content.social_links[key] || ''} onChange={(event) => updateSection('social_links', key, event.target.value)} />
              </Field>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Footer and SEO" icon={Settings}>
          <div className="grid gap-4">
            <Field label="Footer description"><Textarea value={content.footer.description || ''} onChange={(event) => updateSection('footer', 'description', event.target.value)} rows={3} /></Field>
            <Field label="Copyright text"><Input value={content.footer.copyright || ''} onChange={(event) => updateSection('footer', 'copyright', event.target.value)} /></Field>
            <Field label="SEO title"><Input value={content.seo.title || ''} onChange={(event) => updateSection('seo', 'title', event.target.value)} /></Field>
            <Field label="SEO description"><Textarea value={content.seo.description || ''} onChange={(event) => updateSection('seo', 'description', event.target.value)} rows={3} /></Field>
            <Field label="SEO keywords"><Input value={content.seo.keywords || ''} onChange={(event) => updateSection('seo', 'keywords', event.target.value)} /></Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Theme and store settings" icon={Palette}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary color"><Input type="color" value={content.theme.primary_color || '#1e3a8a'} onChange={(event) => updateSection('theme', 'primary_color', event.target.value)} className="h-12 p-2" /></Field>
            <Field label="Accent color"><Input type="color" value={content.theme.accent_color || '#f59e0b'} onChange={(event) => updateSection('theme', 'accent_color', event.target.value)} className="h-12 p-2" /></Field>
            <Field label="Body font"><Input value={content.theme.body_font || ''} onChange={(event) => updateSection('theme', 'body_font', event.target.value)} /></Field>
            <Field label="Heading font"><Input value={content.theme.heading_font || ''} onChange={(event) => updateSection('theme', 'heading_font', event.target.value)} /></Field>
            <Field label="Announcement"><Input value={content.website_settings.announcement || ''} onChange={(event) => updateSection('website_settings', 'announcement', event.target.value)} /></Field>
            <CheckField checked={content.website_settings.cod_enabled !== false} onChange={(value) => updateSection('website_settings', 'cod_enabled', value)} label="COD enabled" />
            <CheckField checked={content.website_settings.gst_invoice_enabled !== false} onChange={(value) => updateSection('website_settings', 'gst_invoice_enabled', value)} label="GST invoice enabled" />
          </div>
        </SettingsCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {contentGroups.map((group) => (
          <ListEditor
            key={group.key}
            group={group}
            items={content[group.key] || []}
            onChange={(items) => updateList(group.key, items)}
            uploadFile={uploadFile}
            products={products}
          />
        ))}
      </div>
    </div>
  );
}

function MediaPanel({ media, uploadFile, deleteMedia }) {
  const [busy, setBusy] = useState(false);
  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      for (const file of files) await uploadFile(file);
      toast.success('Media uploaded');
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <div className="mt-8 section-panel p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Media library</h2>
          <p className="mt-1 text-sm text-slate-500">Uploaded product, logo, banner, carousel, advertisement, and promotional files.</p>
        </div>
        <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-navy px-4 text-sm font-semibold text-white hover:bg-slate-800">
          <Upload size={16} className="mr-2" />Upload
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" multiple onChange={handleUpload} disabled={busy} className="hidden" />
        </label>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {media.map((item) => (
          <div key={item.id || item.filename} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid h-40 place-items-center overflow-hidden rounded-2xl bg-white">
              {item.content_type?.startsWith('image/') ? (
                <img src={item.url} alt={item.original_name || item.filename} className="h-full w-full object-contain p-3" />
              ) : (
                <video src={item.url} className="h-full w-full object-contain p-3" controls />
              )}
            </div>
            <p className="mt-3 truncate text-sm font-semibold text-slate-900">{item.original_name || item.filename}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{item.url}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => navigator.clipboard?.writeText(item.url)}>Copy URL</Button>
              <Button size="sm" variant="outline" onClick={() => deleteMedia(item)}><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
        {media.length === 0 && <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-4">No uploads yet.</div>}
      </div>
    </div>
  );
}

function OrdersPanel({ orders, updateStatus, statusBusy, onViewOrder }) {
  return (
    <div className="mt-8 section-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
          <p className="mt-1 text-sm text-slate-500">Update order status and review customer details.</p>
        </div>
      </div>
      <OrdersTable orders={orders} updateStatus={updateStatus} statusBusy={statusBusy} onViewOrder={onViewOrder} />
    </div>
  );
}

function OrdersTable({ orders, updateStatus, statusBusy, onViewOrder }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full text-left text-sm text-slate-700">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No orders yet.</td></tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-200 last:border-b-0">
                <td className="px-4 py-4">#{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-4">{order.address?.full_name || '-'}</td>
                <td className="px-4 py-4">{inr(order.total)}</td>
                <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{order.status}</span></td>
                <td className="px-4 py-4">
                  <div className="flex min-w-[250px] flex-col gap-2 sm:flex-row">
                    <Button size="sm" variant="outline" onClick={() => onViewOrder(order.id)}><Eye size={14} />Order Info</Button>
                    <Select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} disabled={statusBusy === order.id}>
                      {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                    </Select>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function OrderInfoModal({ order, loading, error, onClose }) {
  const placed = formatDateTime(order?.created_at);
  const shippingLines = addressLines(order?.address);
  const billing = order?.billing_address || order?.billingAddress;
  const billingLines = addressLines(billing);
  const customer = order?.customer || {};
  const customerName = customer.name || order?.address?.full_name;
  const customerEmail = customer.email || order?.address?.email;
  const customerPhone = order?.address?.phone || customer.phone;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="section-eyebrow">Order Info</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{order?.id ? `#${order.id.slice(0, 8).toUpperCase()}` : 'Order details'}</h2>
            <p className="mt-1 text-sm text-slate-500">Complete stored information for this order.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm text-slate-500">Loading order details...</div>}
          {!loading && error && <div className="rounded-3xl bg-red-50 p-8 text-center text-sm font-semibold text-red-700">{error}</div>}
          {!loading && !error && order && (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <DetailSection title="Order Information">
                  <DetailGrid items={[
                    ['Order ID', order.id],
                    ['Order date', placed.date],
                    ['Order time', placed.time],
                    ['Current status', order.status],
                    ['Payment status', order.payment_status],
                    ['Payment method', order.payment_method],
                    ['Transaction/payment ID', order.transaction_id || order.payment_id],
                    ['Subtotal', moneyOrUnavailable(order.subtotal)],
                    ['Discount', order.discount === undefined ? 'Not available' : inr(order.discount)],
                    ['Coupon code', order.coupon_code],
                    ['Shipping/delivery charge', moneyOrUnavailable(order.shipping)],
                    ['Tax/GST', moneyOrUnavailable(order.gst || order.tax)],
                    ['Final order total', moneyOrUnavailable(order.total)],
                    ['Currency', order.currency || 'INR'],
                  ]} />
                </DetailSection>

                <DetailSection title="Customer Information">
                  <DetailGrid items={[
                    ['Customer name', customerName],
                    ['Email', customerEmail],
                    ['Phone number', customerPhone],
                    ['Alternate phone number', order.address?.alternate_phone || customer.alternate_phone],
                    ['Customer/account ID', order.user_id || customer.id],
                  ]} />
                </DetailSection>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <AddressBlock title="Shipping Address" lines={shippingLines} />
                {billing ? <AddressBlock title="Billing Address" lines={billingLines} /> : <AddressBlock title="Billing Address" lines={['Same as shipping address']} />}
              </div>

              <DetailSection title="Ordered Products">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-3 py-3">Product</th>
                        <th className="px-3 py-3">ID/SKU</th>
                        <th className="px-3 py-3">Qty</th>
                        <th className="px-3 py-3">Unit price</th>
                        <th className="px-3 py-3">Discount</th>
                        <th className="px-3 py-3">Tax/GST</th>
                        <th className="px-3 py-3">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, index) => (
                        <tr key={`${item.product_id || item.name}-${index}`} className="border-b border-slate-200 last:border-b-0">
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              {item.image ? <img src={item.image} alt={item.name || 'Product'} className="h-12 w-12 rounded-2xl bg-slate-50 object-contain p-1" /> : <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-xs text-slate-400">No image</div>}
                              <div>
                                <div className="font-semibold text-slate-900">{unavailable(item.name)}</div>
                                <div className="text-xs text-slate-500">{unavailable(item.variant || item.specification)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">{unavailable(item.sku || item.product_id)}</td>
                          <td className="px-3 py-4">{unavailable(item.quantity)}</td>
                          <td className="px-3 py-4">{moneyOrUnavailable(item.price)}</td>
                          <td className="px-3 py-4">{item.discount === undefined ? 'Not available' : inr(item.discount)}</td>
                          <td className="px-3 py-4">{item.gst === undefined && item.tax === undefined ? 'Not available' : inr(item.gst || item.tax)}</td>
                          <td className="px-3 py-4 font-semibold text-slate-900">{moneyOrUnavailable(item.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(order.items || []).length === 0 && <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">No ordered products found.</div>}
                </div>
              </DetailSection>

              <div className="grid gap-4 lg:grid-cols-2">
                <DetailSection title="Order Status">
                  <div className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{unavailable(order.status)}</div>
                </DetailSection>
                <DetailSection title="Order Timeline">
                  {order.created_at ? (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Order placed</span>
                      <span className="ml-2 text-slate-500">{placed.date} {placed.time}</span>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No timeline events available.</div>
                  )}
                </DetailSection>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailGrid({ items }) {
  return (
    <div className="grid gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
          <span className="text-sm font-semibold text-slate-900 sm:text-right">{unavailable(value)}</span>
        </div>
      ))}
    </div>
  );
}

function AddressBlock({ title, lines }) {
  return (
    <DetailSection title={title}>
      {lines.length ? (
        <div className="space-y-2 text-sm text-slate-700">
          {lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Not available</p>
      )}
    </DetailSection>
  );
}

function ListEditor({ group, items, onChange, uploadFile, products }) {
  const addItem = () => {
    onChange([...(items || []), { id: clientId(), ...(group.defaults || { title: '', subtitle: '', image: '', link: '', active: true, sort_order: items.length }) }]);
  };
  const updateItem = (index, key, value) => {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };
  const move = (index, offset) => {
    const next = [...items];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const remove = (index) => onChange(items.filter((_, itemIndex) => itemIndex !== index));
  const Icon = group.icon || Layers;

  return (
    <div className="section-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-navy"><Icon size={18} /></span>
          <div>
            <h3 className="font-semibold text-slate-900">{group.title}</h3>
            <p className="text-xs text-slate-500">{items.length} items</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={addItem}><Plus size={14} className="mr-2" />Add</Button>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">{item.title || item.name || item.code || `Item ${index + 1}`}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => move(index, -1)} className="rounded-xl bg-white p-2 text-slate-500 hover:text-navy"><ChevronUp size={14} /></button>
                <button type="button" onClick={() => move(index, 1)} className="rounded-xl bg-white p-2 text-slate-500 hover:text-navy"><ChevronDown size={14} /></button>
                <button type="button" onClick={() => remove(index)} className="rounded-xl bg-white p-2 text-slate-500 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {group.fields.map((field) => (
                <ContentField
                  key={field.key}
                  field={field}
                  value={item[field.key]}
                  onChange={(value) => updateItem(index, field.key, value)}
                  uploadFile={uploadFile}
                  products={products}
                />
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">No items yet.</div>}
      </div>
    </div>
  );
}

function ContentField({ field, value, onChange, uploadFile, products }) {
  if (field.type === 'checkbox') {
    return <CheckField checked={value !== false} onChange={onChange} label={field.label} />;
  }
  if (field.type === 'textarea') {
    return <Field label={field.label}><Textarea value={value || ''} onChange={(event) => onChange(event.target.value)} rows={3} /></Field>;
  }
  if (field.type === 'image') {
    return <SingleMediaInput label={field.label} value={value || ''} onChange={onChange} uploadFile={uploadFile} />;
  }
  if (field.type === 'product') {
    return (
      <Field label={field.label}>
        <Select value={value || ''} onChange={(event) => onChange(event.target.value)}>
          <option value="">All products / general</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </Select>
      </Field>
    );
  }
  if (field.type === 'select') {
    return (
      <Field label={field.label}>
        <Select value={value || ''} onChange={(event) => onChange(event.target.value)}>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </Select>
      </Field>
    );
  }
  return <Field label={field.label}><Input type={field.type || 'text'} value={value ?? ''} onChange={(event) => onChange(field.type === 'number' ? Number(event.target.value || 0) : event.target.value)} /></Field>;
}

function MediaList({ label, values, onChange, uploadFile, accept, preview }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const result = await uploadFile(file);
        uploaded.push(result.url);
      }
      onChange([...(values || []), ...uploaded]);
      toast.success('Upload complete');
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const move = (index, offset) => {
    const next = [...values];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">Upload files or add an existing URL. Reorder with the arrow controls.</p>
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100">
          <Upload size={15} className="mr-2" />Upload
          <input type="file" accept={accept} multiple onChange={handleUpload} disabled={busy} className="hidden" />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste image or video URL" />
        <Button type="button" variant="outline" onClick={() => { if (url.trim()) onChange([...(values || []), url.trim()]); setUrl(''); }}>Add</Button>
      </div>
      <div className="mt-4 space-y-3">
        {(values || []).map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-2xl bg-white p-3">
            {preview ? <img src={item} alt="" className="h-14 w-14 rounded-xl object-contain" /> : <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><LinkIcon size={16} /></span>}
            <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{item}</span>
            <button type="button" onClick={() => move(index, -1)} className="rounded-xl bg-slate-50 p-2 text-slate-500 hover:text-navy"><ChevronUp size={14} /></button>
            <button type="button" onClick={() => move(index, 1)} className="rounded-xl bg-slate-50 p-2 text-slate-500 hover:text-navy"><ChevronDown size={14} /></button>
            <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl bg-slate-50 p-2 text-slate-500 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleMediaInput({ label, value, onChange, uploadFile }) {
  const [busy, setBusy] = useState(false);
  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await uploadFile(file);
      onChange(result.url);
      toast.success('Uploaded');
    } catch (error) {
      toast.error(fmtError(error.response?.data?.detail));
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <Field label={label}>
      <div className="flex gap-2">
        <Input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="URL or uploaded path" />
        <label className="inline-flex h-[46px] cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-100">
          <Upload size={15} />
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleUpload} disabled={busy} className="hidden" />
        </label>
      </div>
      {value ? <img src={value} alt="" className="mt-3 h-24 w-full rounded-2xl bg-slate-50 object-contain p-3" /> : null}
    </Field>
  );
}

function SettingsCard({ title, icon: Icon, children }) {
  return (
    <div className="section-panel p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-navy"><Icon size={18} /></span>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="section-panel p-6">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-navy">
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <div className={className || ''}>
      <Label className="mb-2">{label}</Label>
      {children}
    </div>
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-blue-200 ${props.className || ''}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-navy focus:ring-2 focus:ring-blue-200 ${props.className || ''}`}
    />
  );
}

function CheckField({ checked, onChange, label }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <input type="checkbox" checked={!!checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-blue-200" />
      {label}
    </label>
  );
}
