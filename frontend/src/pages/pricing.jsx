import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  useEffect(() => {
    document.title = 'Pricing — RM Project'
  }, [])

  const plans = [
    {
      name: 'Start Free',
      tagline: '14-day free trial',
      monthly: 0,
      yearly: 0,
      cta: 'Start Free Trial',
      href: '/signup',
      previewHref: '/features',
      features: [
        'All core features',
        'Basic analytics',
        '1 user included',
        'Limited invoices',
        'Email support',
      ],
    },
    {
      name: 'Small Business',
      tagline: 'Best for growing teams',
      monthly: 200,
      yearly: 2000,
      highlight: true,
      cta: 'Choose Small Business',
      href: '/signup',
      previewHref: '/features#analytics',
      features: [
        'Everything in Start Free',
        'Advanced analytics & dashboards',
        'Automated invoicing & reconciliation',
        'Reports & exports',
        'Up to 5 users',
        'Priority email support',
      ],
    },
    {
      name: 'Enterprise',
      tagline: 'Custom pricing',
      monthly: null,
      yearly: null,
      cta: 'Contact Sales',
      href: '/contact',
      previewHref: '/features#security',
      features: [
        'Unlimited users',
        'SSO/SAML & RBAC',
        'Custom data onboarding',
        'Dedicated success manager',
        'Premium support & SLA',
        'Advanced integrations',
      ],
    },
  ]

  function formatPrice(p) {
    if (p === null) return 'Custom'
    const val = yearly ? (p === 0 ? 0 : p) : p
    const nf = new Intl.NumberFormat('en-US')
    return `$${nf.format(val)}/${yearly ? 'year' : 'month'}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="pt-16">
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Pricing</h1>
              <p className="mt-2 text-secondary-600">Start with a 14‑day free trial. Upgrade anytime.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!yearly ? 'text-secondary-900' : 'text-secondary-500'}`}>Monthly</span>
              <button onClick={() => setYearly((v) => !v)} className="relative h-6 w-11 rounded-full bg-secondary-300 transition-colors">
                <span className={`absolute top-0.5 ${yearly ? 'left-6' : 'left-0.5'} h-5 w-5 rounded-full bg-white shadow transition-all`} />
              </button>
              <span className={`text-sm ${yearly ? 'text-secondary-900' : 'text-secondary-500'}`}>Yearly</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl border ${p.highlight ? 'border-primary-300 ring-2 ring-primary-100' : 'border-secondary-200'} bg-white hover:shadow-soft transition-shadow h-full flex flex-col`}>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-secondary-900">{p.name}</div>
                      <div className="mt-2 text-3xl font-bold text-secondary-900">{formatPrice(yearly ? p.yearly : p.monthly)}</div>
                    </div>
                    {p.tagline ? (
                      <span className={`text-xs px-2 py-1 rounded-md ${p.highlight ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-secondary-100 text-secondary-700'}`}>{p.tagline}</span>
                    ) : null}
                  </div>

                  {yearly && p.monthly && (
                    <div className="mt-2 text-xs text-success-700 bg-success-50 inline-flex w-fit px-2 py-1 rounded">Save with yearly billing</div>
                  )}

                  <ul className="mt-4 space-y-2 text-sm text-secondary-700">
                    {p.features.map((it) => (<li key={it}>• {it}</li>))}
                  </ul>
                </div>
                <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a href={p.href} className="col-span-1 sm:col-span-2 text-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">{p.cta}</a>
                  <a href={p.previewHref} className="hidden sm:block text-center px-4 py-2 rounded-md border border-secondary-300 hover:bg-secondary-50 transition-colors text-sm">Preview features</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-xl md:text-2xl font-semibold text-secondary-900">Compare plans</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm border border-secondary-200 rounded-xl overflow-hidden">
              <thead className="bg-secondary-50 sticky top-16">
                <tr className="text-secondary-600">
                  <th className="py-3 px-4 text-left">Feature</th>
                  <th className="py-3 px-4 text-center">Start Free</th>
                  <th className="py-3 px-4 text-center">Small Business</th>
                  <th className="py-3 px-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {[
                  ['Users included', '1', 'Up to 5', 'Unlimited'],
                  ['Analytics & dashboards', 'Basic', 'Advanced', 'Advanced'],
                  ['Automated invoicing', false, true, 'Included + custom workflows'],
                  ['Reports & exports', 'Basic', 'Advanced', 'Advanced + custom'],
                  ['SSO/SAML & RBAC', false, false, true],
                  ['Support', 'Email', 'Priority email', 'Premium with SLA'],
                ].map((row) => (
                  <tr key={row[0]} className="bg-white">
                    <td className="py-4 px-4 text-secondary-900">{row[0]}</td>
                    {row.slice(1).map((val, idx) => (
                      <td key={idx} className="py-4 px-4 text-center align-middle">
                        {typeof val === 'boolean' ? (
                          val ? (
                            <span aria-label="Included" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-100 text-success-700">✓</span>
                          ) : (
                            <span aria-label="Not included" className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-secondary-500">—</span>
                          )
                        ) : (
                          <span className="text-secondary-700">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-secondary-500">Features marked with ✓ are included in the plan.</div>
        </section>

        {/* Social proof band */}
        <section className="bg-secondary-50/60">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-secondary-900">Trusted by finance teams</h3>
              <p className="mt-2 text-secondary-600">RM Project powers real-time visibility and controls across growing businesses.</p>
              <div className="mt-4 text-sm text-secondary-700">14‑day free trial. No credit card required. Cancel anytime.</div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="h-10 rounded bg-white border border-secondary-200 grid place-items-center text-secondary-500">Logo</div>
              <div className="h-10 rounded bg-white border border-secondary-200 grid place-items-center text-secondary-500">Logo</div>
              <div className="h-10 rounded bg-white border border-secondary-200 grid place-items-center text-secondary-500">Logo</div>
              <div className="h-10 rounded bg-white border border-secondary-200 grid place-items-center text-secondary-500">Logo</div>
              <div className="h-10 rounded bg-white border border-secondary-200 grid place-items-center text-secondary-500">Logo</div>
              <div className="h-10 rounded bg-white border border-secondary-200 grid place-items-center text-secondary-500">Logo</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-xl md:text-2xl font-semibold text-secondary-900 text-center">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-secondary-200 border border-secondary-200 rounded-xl bg-white">
            {[{
              q: 'Can I try RM Project for free?', a: 'Yes. Start Free includes a 14‑day trial of core features. No credit card is required.'
            }, {
              q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade anytime; changes take effect on the next billing cycle.'
            }, {
              q: 'Do you offer discounts for yearly billing?', a: 'Yes. Yearly billing offers savings versus monthly. Toggle Monthly/Yearly to compare.'
            }, {
              q: 'How does Enterprise pricing work?', a: 'Enterprise is custom—contact sales to tailor features, onboarding, and SLAs to your needs.'
            }].map((f) => (
              <details key={f.q} className="group open:bg-secondary-50/50">
                <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between">
                  <span className="font-medium text-secondary-900">{f.q}</span>
                  <span className="text-secondary-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 text-sm text-secondary-700">{f.a}</div>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-secondary-700">
            Still have questions? <a className="text-primary-700 hover:underline" href="/contact">Contact sales</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


