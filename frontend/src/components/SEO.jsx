import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setCanonical, setMetaName, setMetaProperty } from '../lib/content.js';

const SITE_URL = 'https://shradhasales.vercel.app';
const SITE_NAME = 'shradhasales';
const DEFAULT_DESCRIPTION = 'Premium commercial and home appliances from shradhasales with trusted brands, fast checkout, GST invoices, and customer support.';

export default function SEO({ title, description = DEFAULT_DESCRIPTION, image = '/images/products/hero-appliances.svg', type = 'website', schema }) {
  const location = useLocation();
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const url = `${SITE_URL}${location.pathname}${location.search}`;

  useEffect(() => {
    document.title = pageTitle;
    setCanonical(`${location.pathname}${location.search}`);
    setMetaName('description', description);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', pageTitle);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', new URL(image, SITE_URL).toString());
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaProperty('og:title', pageTitle);
    setMetaProperty('og:description', description);
    setMetaProperty('og:type', type);
    setMetaProperty('og:url', url);
    setMetaProperty('og:image', new URL(image, SITE_URL).toString());

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
  }, [description, image, location.pathname, location.search, pageTitle, schema, type, url]);

  return null;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/products/hero-appliances.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@shradhasales.com',
      contactType: 'customer support',
    },
  };
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

