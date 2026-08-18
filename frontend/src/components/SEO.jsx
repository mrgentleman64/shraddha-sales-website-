import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setCanonical, setMetaName, setMetaProperty } from '../lib/content.js';

const SITE_URL = 'https://shradhasales.vercel.app';
const SITE_NAME = 'Shraddha Sales';
const DEFAULT_DESCRIPTION = 'Commercial refrigeration, water coolers, air conditioners, bakery equipment, and trusted appliance solutions from Shraddha Sales.';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = '/images/products/hero-appliances.svg',
  type = 'website',
  schema,
  robots = 'index, follow',
  canonicalPath,
}) {
  const location = useLocation();
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = canonicalPath || location.pathname || '/';
  const url = new URL(canonical, SITE_URL).toString();

  useEffect(() => {
    document.title = pageTitle;
    setCanonical(canonical);
    setMetaName('description', description);
    setMetaName('robots', robots);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', pageTitle);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', absoluteUrl(image));
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaProperty('og:title', pageTitle);
    setMetaProperty('og:description', description);
    setMetaProperty('og:type', type);
    setMetaProperty('og:url', url);
    setMetaProperty('og:image', absoluteUrl(image));

    let script = document.querySelector('script[data-seo-schema="page"]');
    if (schema) {
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-schema', 'page');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    } else if (script) {
      script.remove();
    }
  }, [canonical, description, image, pageTitle, robots, schema, type, url]);

  return null;
}

export function organizationSchema(content = {}) {
  const branding = content.branding || {};
  const contact = content.contact || {};
  const socialLinks = Object.values(content.social_links || {}).filter(Boolean);
  return cleanSchema({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: branding.site_name || SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(branding.website_logo || branding.company_logo || branding.footer_logo || '/images/products/hero-appliances.svg'),
    description: content.footer?.description || DEFAULT_DESCRIPTION,
    telephone: contact.phone,
    email: contact.email,
    sameAs: socialLinks.length ? socialLinks : undefined,
    contactPoint: contact.email || contact.phone ? {
      '@type': 'ContactPoint',
      telephone: contact.phone,
      email: contact.email,
      contactType: 'customer support',
    } : undefined,
  });
}

export function localBusinessSchema(content = {}) {
  const branding = content.branding || {};
  const contact = content.contact || {};
  const socialLinks = Object.values(content.social_links || {}).filter(Boolean);
  return cleanSchema({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: branding.site_name || SITE_NAME,
    image: absoluteUrl(branding.company_logo || branding.website_logo || branding.footer_logo || '/images/products/hero-appliances.svg'),
    url: SITE_URL,
    telephone: contact.phone,
    email: contact.email,
    address: contact.address ? {
      '@type': 'PostalAddress',
      streetAddress: contact.address,
    } : undefined,
    openingHours: contact.working_hours,
    areaServed: contact.locations,
    sameAs: socialLinks.length ? socialLinks : undefined,
  });
}

export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function absoluteUrl(value) {
  if (!value) return undefined;
  return new URL(value, SITE_URL).toString();
}

export function cleanSchema(value) {
  if (Array.isArray(value)) {
    return value.map(cleanSchema).filter((item) => item !== undefined);
  }
  if (!value || typeof value !== 'object') return value === '' || value === null ? undefined : value;
  return Object.entries(value).reduce((acc, [key, item]) => {
    const cleaned = cleanSchema(item);
    if (cleaned !== undefined && !(Array.isArray(cleaned) && cleaned.length === 0)) acc[key] = cleaned;
    return acc;
  }, {});
}
