export default function About() {
  return (
    <div className="container mx-auto px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_0.8fr] items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">About Shraddha Sales</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Shraddha Sales brings premium commercial appliances to your doorstep with fast delivery, trusted brands, and seamless checkout. Built for businesses that want better value and curated choices.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-100 mb-4">
                <span className="text-xl">📦</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Fast shipping</h2>
              <p className="mt-3 text-sm text-slate-500">Delivered quickly across India with reliable partners and careful packaging.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-100 mb-4">
                <span className="text-xl">⭐</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Trusted brands</h2>
              <p className="mt-3 text-sm text-slate-500">Handpicked appliances from leading brands for quality and value.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-100 mb-4">
                <span className="text-xl">🔒</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Secure checkout</h2>
              <p className="mt-3 text-sm text-slate-500">Protect your data with secure authentication and encrypted payments.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-orange-100 mb-4">
                <span className="text-xl">💬</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Expert support</h2>
              <p className="mt-3 text-sm text-slate-500">Need help? Our support team is ready to answer product and order questions.</p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-navy p-10 text-white shadow-xl">
          <div className="text-5xl mb-6 text-center">🏢</div>
          <h3 className="text-2xl font-semibold">Why choose us</h3>
          <p className="mt-4 text-sm leading-7 text-slate-200">We believe shopping commercial appliances should be easy, affordable, and dependable. Every product is reviewed for performance, energy efficiency, and customer satisfaction.</p>
          <div className="mt-8 space-y-5 text-sm">
            <div className="rounded-3xl bg-slate-900/70 p-4 hover:bg-slate-800/70 transition">
              <strong>✓ Personalized recommendations</strong> based on top categories and trending deals.
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4 hover:bg-slate-800/70 transition">
              <strong>✓ Buy with confidence</strong> backed by accurate product details and fast support.
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4 hover:bg-slate-800/70 transition">
              <strong>✓ Order tracking</strong> to keep your purchase visible from checkout to delivery.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
