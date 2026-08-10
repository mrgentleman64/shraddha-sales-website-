export const fallbackContent = {
  branding: {
    site_name: 'shradhasales',
    tagline: 'Cooling · Kitchen · Bakery',
    company_logo: '',
    website_logo: '',
    footer_logo: '',
    favicon: '',
  },
  hero_banners: [
    {
      title: 'Build a modern appliance storefront with trust, speed, and clarity.',
      subtitle: 'Discover refrigerators, ACs, coolers, deep freezers and bakery equipment from top brands with premium UX designed for Indian businesses.',
      eyebrow: 'Premium cooling solutions',
      image: '',
      cta_label: 'Shop products',
      cta_link: '/products',
      secondary_label: 'Browse categories',
      secondary_link: '/categories',
      active: true,
      sort_order: 0,
    },
  ],
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

export function mergeContent(content) {
  const merged = { ...fallbackContent, ...(content || {}) };
  for (const key of ['branding', 'contact', 'social_links', 'footer', 'seo', 'theme', 'website_settings']) {
    merged[key] = { ...fallbackContent[key], ...((content || {})[key] || {}) };
  }
  for (const key of ['hero_banners', 'homepage_banners', 'promotional_images', 'carousel_images', 'festival_offers', 'sale_banners', 'advertisement_banners', 'homepage_sections', 'testimonials', 'customer_reviews', 'coupons']) {
    merged[key] = Array.isArray(merged[key]) ? merged[key] : [];
  }
  return merged;
}

export function activeItems(items) {
  return [...(items || [])]
    .filter((item) => item.active !== false)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

export function firstActive(items) {
  return activeItems(items)[0];
}

export function applySiteContent(content) {
  const merged = mergeContent(content);
  const root = document.documentElement;
  if (merged.theme.primary_color) root.style.setProperty('--color-navy', merged.theme.primary_color);
  if (merged.theme.accent_color) root.style.setProperty('--color-accent', merged.theme.accent_color);
  if (merged.theme.body_font) root.style.setProperty('--body-font', `'${merged.theme.body_font}', ui-sans-serif, system-ui, sans-serif`);
  if (merged.theme.heading_font) root.style.setProperty('--heading-font', `'${merged.theme.heading_font}', ui-sans-serif, system-ui, sans-serif`);

  document.title = merged.seo.title || merged.branding.site_name || 'shradhasales';
  setMeta('description', merged.seo.description);
  setMeta('keywords', merged.seo.keywords);
  setMeta('theme-color', merged.theme.primary_color || '#1e3a8a');
  setMetaProperty('og:site_name', merged.branding.site_name || 'shradhasales');
  setMetaProperty('og:title', merged.seo.title || 'shradhasales');
  setMetaProperty('og:description', merged.seo.description);
  setMetaProperty('og:type', 'website');
  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', merged.seo.title || 'shradhasales');
  setMetaName('twitter:description', merged.seo.description);
  if (merged.branding.favicon) setFavicon(merged.branding.favicon);
}

function setMeta(name, content) {
  setMetaName(name, content);
}

export function setMetaName(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setFavicon(href) {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'icon');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function setMetaProperty(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function setCanonical(path = '/') {
  const href = new URL(path, 'https://shradhasales.vercel.app').toString();
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}