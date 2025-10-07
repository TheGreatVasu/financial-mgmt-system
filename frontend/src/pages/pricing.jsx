import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)

  useEffect(() => {
    document.title = 'Pricing — FinFlow'
  }, [])

  const plans = [
    {
      name: 'Starter',
      tagline: 'Perfect for small businesses',
      monthly: 0,
      yearly: 0,
      cta: 'Start Free Trial',
      href: '/signup',
      popular: false,
      features: [
        'Up to 100 invoices per month',
        'Basic analytics dashboard',
        '1 user account',
        'Email support',
        'PDF export',
        'Mobile app access',
        'Basic reporting',
        'Standard security'
      ],
      limitations: [
        'Limited to 100 invoices/month',
        'Basic analytics only',
        'Single user account'
      ]
    },
    {
      name: 'Professional',
      tagline: 'Most popular for growing businesses',
      monthly: 999,
      yearly: 9990,
      cta: 'Start Free Trial',
      href: '/signup',
      popular: true,
      features: [
        'Unlimited invoices',
        'Advanced analytics & reports',
        'Up to 5 user accounts',
        'Priority email support',
        'PDF & Excel export',
        'Automated invoicing',
        'Payment tracking',
        'WhatsApp notifications',
        'Custom reporting',
        'API access',
        'Advanced security',
        'Data import/export'
      ],
      limitations: []
    },
    {
      name: 'Enterprise',
      tagline: 'For large organizations',
      monthly: null,
      yearly: null,
      cta: 'Contact Sales',
      href: '/contact',
      popular: false,
      features: [
        'Everything in Professional',
        'Unlimited users',
        'Custom integrations',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom reporting',
        'Advanced API access',
        'On-premise deployment',
        'SSO/SAML integration',
        'Custom workflows',
        'White-label options',
        'SLA guarantee'
      ],
      limitations: []
    }
  ]

  const faqs = [
    {
      question: 'Can I try FinFlow for free?',
      answer: 'Yes! All plans include a 14-day free trial with full access to features. No credit card required to start.'
    },
    {
      question: 'What happens after my free trial?',
      answer: 'After 14 days, you can choose to upgrade to a paid plan or continue with limited features. We\'ll notify you before your trial ends.'
    },
    {
      question: 'Can I switch plans anytime?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes! Annual billing saves you 2 months compared to monthly billing. You can toggle between monthly and yearly pricing above.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, bank transfers, and PayPal. Enterprise customers can also pay via invoice.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-grade security with end-to-end encryption, regular backups, and comply with industry security standards.'
    },
    {
      question: 'Do you offer custom integrations?',
      answer: 'Yes! Professional and Enterprise plans include API access. Enterprise customers get custom integrations and dedicated support.'
    },
    {
      question: 'What support do you provide?',
      answer: 'Starter includes email support, Professional includes priority email support, and Enterprise includes 24/7 phone support with dedicated account management.'
    }
  ]

  const features = [
    'Real-time Analytics',
    'Automated Invoicing',
    'Payment Tracking',
    'Financial Reports',
    'Data Import/Export',
    'Mobile App',
    'API Access',
    'Custom Integrations',
    'SSO/SAML',
    '24/7 Support',
    'Dedicated Manager',
    'SLA Guarantee'
  ]

  function formatPrice(price) {
    if (price === null) return 'Custom'
    if (price === 0) return 'Free'
    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
    return `${formattedPrice}/${yearly ? 'year' : 'month'}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
            <div className="text-center text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Simple, Transparent Pricing
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Choose the Perfect Plan
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  for Your Business
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Start with a free trial, then choose the plan that grows with your business. 
                All plans include our core features with no hidden fees.
              </p>
              
              {/* Pricing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${!yearly ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
                <button 
                  onClick={() => setYearly(!yearly)} 
                  className="relative h-8 w-14 rounded-full bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className={`absolute top-1 ${yearly ? 'left-7' : 'left-1'} h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-200`} />
                </button>
                <span className={`text-sm font-medium ${yearly ? 'text-white' : 'text-slate-400'}`}>Yearly</span>
                {yearly && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-200 text-xs font-medium">
                    Save 17%
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div key={index} className={`relative rounded-2xl border-2 p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col ${
                  plan.popular 
                    ? 'border-blue-500 ring-4 ring-blue-100 scale-105' 
                    : 'border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.tagline}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">{formatPrice(yearly ? plan.yearly : plan.monthly)}</span>
                    </div>
                    {yearly && plan.monthly && plan.monthly > 0 && (
                      <div className="mt-2 text-sm text-green-600 font-medium">
                        Save ₹{(plan.monthly * 12) - plan.yearly} annually
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to={plan.href} 
                    className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 mt-auto whitespace-nowrap ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                All plans include a 14-day free trial. No credit card required.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cancel anytime
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Bank-grade security
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 support
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Compare All Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See exactly what's included in each plan and choose the one that fits your needs.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Features</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Starter</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Professional</th>
                    <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {features.map((feature, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{feature}</td>
                      <td className="py-4 px-6 text-center">
                        {['Real-time Analytics', 'Automated Invoicing', 'Payment Tracking', 'Financial Reports', 'Data Import/Export', 'Mobile App'].includes(feature) ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trusted by 500+ Businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join companies that have transformed their financial operations with FinFlow.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-400 font-semibold">Logo {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our pricing and plans.
              </p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <details className="group">
                    <summary className="list-none cursor-pointer px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      <svg className="w-5 h-5 text-gray-500 group-open:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                  </details>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Still have questions?</p>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Contact Sales
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses already using FinFlow to streamline their financial operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap"
              >
                Start Your Free Trial
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                Schedule a Demo
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}


