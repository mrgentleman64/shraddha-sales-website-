import { useEffect, useMemo, useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { api } from '../lib/api.js';
import { mergeContent } from '../lib/content.js';
import SEO, { breadcrumbSchema } from '../components/SEO.jsx';

export default function Contact() {
  const [siteContent, setSiteContent] = useState(null);
  const content = useMemo(() => mergeContent(siteContent), [siteContent]);
  const socialLinks = Object.entries(content.social_links || {}).filter(([, value]) => value);

  useEffect(() => {
    api.get('/content').then((res) => setSiteContent(res.data)).catch(() => setSiteContent(null));
  }, []);

  return (
    <div className="page-shell container mx-auto px-4 py-14">
      <SEO title="Contact" description="Contact shradhasales for product questions, order support, and commercial appliance guidance." schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])} />
      <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_0.8fr]">
        <div>
          <p className="section-eyebrow">Support</p>
          <h1 className="section-title mt-2">Contact us</h1>
          <p className="section-copy mt-4 max-w-3xl">Have a question about your order or a product? Reach out anytime and our support team will get back to you fast.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <InfoCard icon={Mail} title="Customer care" value={content.contact.email} color="bg-blue-100" />
            <InfoCard icon={Phone} title="Phone" value={content.contact.phone} color="bg-emerald-100" />
            <InfoCard icon={Clock} title="Working hours" value={content.contact.working_hours} color="bg-amber-100" />
            <InfoCard icon={MapPin} title="Locations" value={content.contact.locations} color="bg-slate-100" />
          </div>
        </div>
        <div className="rounded-[2rem] bg-slate-900 p-10 text-white shadow-lift">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10"><MapPin size={30} /></span>
          </div>
          <h3 className="text-2xl font-semibold text-white">Get in touch</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">For product questions, order issues, or general support, send us a message and we'll respond within one business day.</p>
          <div className="mt-8 space-y-5 text-sm text-slate-300">
            <div className="rounded-3xl bg-white/10 p-4">
              <strong>Email:</strong> {content.contact.email}
            </div>
            <div className="rounded-3xl bg-white/10 p-4">
              <strong>Address:</strong> {content.contact.address}
            </div>
            {socialLinks.length > 0 && (
              <div className="rounded-3xl bg-white/10 p-4">
                <strong>Follow us:</strong>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialLinks.map(([key, value]) => (
                    <a key={key} href={value} target="_blank" rel="noreferrer" className="rounded-full border border-slate-700 px-3 py-1 text-xs capitalize text-slate-200 hover:bg-slate-700">{key}</a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, color }) {
  return (
    <div className="section-panel premium-card-hover p-6">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon size={22} className="text-slate-800" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">{value}</p>
    </div>
  );
}
