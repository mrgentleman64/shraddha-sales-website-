import { Building2, Check, Headphones, PackageCheck, ShieldCheck, Star } from 'lucide-react';
import SEO, { breadcrumbSchema } from '../components/SEO.jsx';

const promises = [
  { icon: PackageCheck, title: 'Fast shipping', copy: 'Delivered quickly across India with reliable partners and careful packaging.', tone: 'bg-amber-50 text-amber-700' },
  { icon: Star, title: 'Trusted brands', copy: 'Handpicked appliances from leading brands for quality and value.', tone: 'bg-emerald-50 text-emerald-700' },
  { icon: ShieldCheck, title: 'Secure checkout', copy: 'Protect your data with secure authentication and encrypted payments.', tone: 'bg-blue-50 text-navy' },
  { icon: Headphones, title: 'Expert support', copy: 'Need help? Our support team is ready to answer product and order questions.', tone: 'bg-orange-50 text-orange-700' },
];

export default function About() {
  return (
    <div className="page-shell container mx-auto px-4 py-14">
      <SEO title="About" description="Learn about shradhasales, a trusted store for premium commercial appliances." schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />
      <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_0.8fr]">
        <div>
          <p className="section-eyebrow">Our promise</p>
          <h1 className="section-title mt-2">About shradhasales</h1>
          <p className="section-copy mt-4 max-w-3xl">shradhasales brings premium commercial appliances to your doorstep with fast delivery, trusted brands, and seamless checkout. Built for businesses that want better value and curated choices.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {promises.map((item) => (
              <div key={item.title} className="section-panel premium-card-hover p-6">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                  <item.icon size={22} />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-navy p-10 text-white shadow-lift">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10"><Building2 size={30} /></span>
          </div>
          <h3 className="text-2xl font-semibold text-white">Why choose us</h3>
          <p className="mt-4 text-sm leading-7 text-slate-200">We believe shopping commercial appliances should be easy, affordable, and dependable. Every product is reviewed for performance, energy efficiency, and customer satisfaction.</p>
          <div className="mt-8 space-y-4 text-sm">
            {['Personalized recommendations based on top categories and trending deals.', 'Buy with confidence backed by accurate product details and fast support.', 'Order tracking to keep your purchase visible from checkout to delivery.'].map((item) => (
              <div key={item} className="flex gap-3 rounded-3xl bg-white/10 p-4 text-slate-200">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
