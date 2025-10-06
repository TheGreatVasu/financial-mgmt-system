import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

export default function FeaturesPage() {
  useEffect(() => {
    document.title = 'Features — RM Project'
  }, [])

  const features = [
    { title: 'Real-time analytics & dashboards', desc: 'Live KPIs and customizable dashboards to monitor performance.' },
    { title: 'Bank-grade security & audit trails', desc: 'RBAC, encryption at rest and in transit, complete auditability.' },
    { title: 'Automated invoicing & reconciliation', desc: 'Save hours with automated billing and payment matching.' },
    { title: 'Budgeting and scenario planning', desc: 'Forecast cash flow and plan for multiple business scenarios.' },
    { title: 'Multi-user collaboration', desc: 'Granular permissions for teams, approvers, and external partners.' },
    { title: 'Access anywhere', desc: 'Responsive experience across desktop, tablet, and mobile.' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero intro */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50" />
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-secondary-900">Everything you need to manage finance at scale</h1>
              <p className="mt-4 text-secondary-600 text-base md:text-lg">From real-time analytics to automated invoicing and secure collaboration—RM Project gives your team clarity and control.</p>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{ icon: 'ic-analytics', ...features[0] }, { icon: 'ic-security', ...features[1] }, { icon: 'ic-invoice', ...features[2] }, { icon: 'ic-budget', ...features[3] }, { icon: 'ic-collab', ...features[4] }, { icon: 'ic-access', ...features[5] }].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-secondary-200 bg-white hover:shadow-soft transition-shadow">
                <div className="h-9 w-9 rounded-md bg-primary-100 text-primary-700 grid place-items-center">
                  <svg className="h-5 w-5" aria-hidden="true">
                    <use href={`/icons.svg#${f.icon}`} />
                  </svg>
                </div>
                <div className="mt-4 font-semibold text-secondary-900">{f.title}</div>
                <p className="mt-2 text-sm text-secondary-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deep dive 1 */}
        <section className="bg-secondary-50/60">
          <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">Analytics that drive action</h2>
              <p className="mt-3 text-secondary-600">Build dashboards tailored to your KPIs. Monitor receivables, spot trends, and forecast with confidence.</p>
              <ul className="mt-4 space-y-2 text-sm text-secondary-700 list-disc pl-5">
                <li>Live charts and smart alerts</li>
                <li>Configurable widgets per role</li>
                <li>Drill-down into customer and invoice detail</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-secondary-200 bg-white p-3 shadow-soft">
              <img src="/feature-analytics.svg" alt="Analytics preview" className="aspect-video w-full rounded-xl object-cover" />
            </div>
          </div>
        </section>

        {/* Deep dive 2 */}
        <section>
          <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-none rounded-2xl border border-secondary-200 bg-white p-3 shadow-soft">
              <img src="/feature-automation.svg" alt="Automation preview" className="aspect-video w-full rounded-xl object-cover" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">Automate invoicing and collections</h2>
              <p className="mt-3 text-secondary-600">Use rules-based workflows to eliminate routine tasks. Set reminders, reconcile payments, and close faster.</p>
              <ul className="mt-4 space-y-2 text-sm text-secondary-700 list-disc pl-5">
                <li>Recurring invoices and reminders</li>
                <li>Automatic reconciliation and audit trail</li>
                <li>Multi-user approvals and roles</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Benefits band */}
        <section className="bg-secondary-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold">97%</div>
              <div className="text-white/80 text-sm">On-time payments</div>
            </div>
            <div>
              <div className="text-2xl font-bold">5 min</div>
              <div className="text-white/80 text-sm">Average reconciliation</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-white/80 text-sm">Real-time insights</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-secondary-900">Ready to get started?</h2>
          <p className="mt-2 text-secondary-600">Sign up in minutes and unlock complete financial visibility.</p>
          <a href="/signup" className="mt-6 inline-block px-5 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium">Get Started</a>
        </section>
      </main>
      <Footer />
    </div>
  )
}


