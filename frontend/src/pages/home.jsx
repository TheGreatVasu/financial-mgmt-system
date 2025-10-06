import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { submitContact } from '../services/publicService'

export default function HomePage() {
  const toast = useToast()

  async function onSubscribe(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = form.get('name')
    const email = form.get('email')
    const message = form.get('message') || 'Website contact request'
    if (!name || !/.+@.+\..+/.test(email)) {
      toast.add('Please provide a valid name and email.', 'error')
      return
    }
    try {
      await submitContact({ name, email, message })
      toast.add('Message sent! We’ll be in touch.', 'success')
      e.currentTarget.reset()
    } catch (err) {
      toast.add('Failed to send message. Try again later.', 'error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main id="main" className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50" />
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-secondary-900">All Your Finances. Clear Insight. Confident Decisions.</h1>
              <p className="mt-4 text-secondary-600 text-base md:text-lg">RM Project brings every transaction, report, and forecast into a single, intuitive workspace so you can monitor cash flow, reduce risk, and make smarter financial decisions.</p>
              <div className="mt-8 flex items-center gap-3">
                <Link to="/signup" className="px-5 py-3 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">Get Started</Link>
                <Link to="/dashboard" className="px-5 py-3 rounded-md border border-secondary-300 text-secondary-900 hover:bg-secondary-50 font-medium transition-colors">Explore Dashboard</Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-primary-600/20 blur-3xl" />
              <div className="relative rounded-2xl border border-secondary-200 p-4 shadow-soft bg-white">
                <img src="/product-hero.svg" alt="RM Project dashboard preview" className="aspect-video w-full rounded-xl object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">Powerful Tools to Manage Your Finances</h2>
            <p className="mt-2 text-secondary-600">Everything you need to stay in control of your business.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Live analytics & dashboards', desc: 'Real-time KPIs, configurable widgets, and alerts.' },
              { title: 'Bank-grade security', desc: 'RBAC, encryption, and full audit trails.' },
              { title: 'Automated invoicing', desc: 'Recurring billing and payment reconciliation.' },
              { title: 'Budgeting & collaboration', desc: 'Forecast scenarios and work with your team.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-secondary-200 bg-white hover:shadow-soft transition-shadow">
                <div className="h-8 w-8 rounded-md bg-primary-100 text-primary-700 grid place-items-center text-sm font-bold">★</div>
                <div className="mt-4 font-semibold text-secondary-900">{f.title}</div>
                <p className="mt-2 text-sm text-secondary-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Product */}
        <section className="bg-secondary-50/60">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">See RM Project in Action</h2>
              <p className="mt-2 text-secondary-600">A unified platform that gives you real-time visibility across your business.</p>
            </div>
            <div className="mt-8 rounded-2xl border border-secondary-200 bg-white p-3 shadow-soft">
              <div className="aspect-video w-full rounded-xl bg-secondary-100 grid place-items-center text-secondary-600">Product screenshot</div>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'Real-Time Revenue & Expense Tracking',
                'Automated Invoicing & Collections',
                'Smart Financial Reports',
                'Role-Based Secure Access',
              ].map((t) => (
                <div key={t} className="p-4 rounded-lg border border-secondary-200 bg-white">
                  <div className="text-sm font-medium text-secondary-900">{t}</div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/signup" className="px-5 py-3 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors">Start Free Trial</Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">How It Works</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your account in minutes.' },
              { step: '2', title: 'Set Up Business', desc: 'Add company details and connect data.' },
              { step: '3', title: 'Start Managing', desc: 'Track finances and collaborate securely.' },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-xl border border-secondary-200 bg-white">
                <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 grid place-items-center text-sm font-bold">{s.step}</div>
                <div className="mt-4 font-semibold text-secondary-900">{s.title}</div>
                <p className="mt-2 text-sm text-secondary-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">Choose the Right Plan for You</h2>
            <p className="mt-2 text-secondary-600">Simple pricing for businesses of all sizes. No hidden fees.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: '₹0', period: '/Free Trial', features: ['Basic analytics', '1 user', 'Limited invoices'] },
              { name: 'Pro', price: '₹999', period: '/month', features: ['All Starter features', 'Automated invoicing', 'Reports', '5 users'] },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited users', 'Priority support', 'Full customization'] },
            ].map((p, idx) => (
              <div key={p.name} className={`rounded-2xl border ${idx === 1 ? 'border-primary-300 ring-2 ring-primary-100' : 'border-secondary-200'} p-6 bg-white hover:shadow-soft transition-shadow`}>
                <div className="font-semibold text-secondary-900">{p.name}</div>
                <div className="mt-2 text-3xl font-bold text-secondary-900">{p.price}<span className="text-base font-medium text-secondary-500">{p.period}</span></div>
                <ul className="mt-4 space-y-2 text-sm text-secondary-700">
                  {p.features.map((it) => (<li key={it}>• {it}</li>))}
                </ul>
                <Link to={p.name === 'Enterprise' ? '/contact' : '/signup'} className="mt-6 inline-block px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">{p.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">Get in Touch</h2>
            <p className="mt-2 text-secondary-600">We’re here to help. Reach out for support, sales, or partnership inquiries.</p>
          </div>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={onSubscribe} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-sm mb-1">Name</label>
                <input name="name" type="text" className="input" placeholder="Your name" required />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm mb-1">Email</label>
                <input name="email" type="email" className="input" placeholder="you@company.com" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm mb-1">Message</label>
                <textarea name="message" className="input min-h-[120px]" placeholder="Write your message..." required />
              </div>
              <div className="sm:col-span-2">
                <button className="btn btn-primary btn-md">Send Message</button>
              </div>
            </form>
            <aside className="lg:col-span-1 space-y-2">
              <div className="p-6 rounded-xl border border-secondary-200 bg-white">
                <div className="font-semibold text-secondary-900">RM Project</div>
                <div className="mt-2 text-sm text-secondary-700">Bengaluru, India</div>
                <div className="mt-1 text-sm"><a className="text-primary-700 hover:underline" href="mailto:support@rmproject.com">support@rmproject.com</a></div>
                <div className="mt-1 text-sm text-secondary-700">+91 00000 00000</div>
              </div>
              <div className="rounded-xl overflow-hidden border border-secondary-200">
                <iframe title="map" className="w-full h-40" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.078476312796!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjciTiA3N8KwMzUnNDEuNiJF!5e0!3m2!1sen!2sin!4v1700000000000"></iframe>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


