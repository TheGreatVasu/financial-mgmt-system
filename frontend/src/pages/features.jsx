import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'

export default function FeaturesPage() {
  useEffect(() => {
    document.title = 'Features — FinFlow'
  }, [])

  const coreFeatures = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Real-Time Analytics Dashboard',
      description: 'Monitor your financial performance with live dashboards, customizable KPIs, and instant insights into cash flow, collections, and business metrics.',
      features: ['Live financial metrics', 'Customizable dashboards', 'Real-time cash flow tracking', 'Performance indicators']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Bank-Grade Security',
      description: 'Enterprise-level security with role-based access control, end-to-end encryption, and comprehensive audit trails for complete data protection.',
      features: ['Role-based access control', 'End-to-end encryption', 'Complete audit trails', 'SOC 2 compliance']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Smart Invoicing & Collections',
      description: 'Create professional invoices, set up recurring billing, and automate payment collection with intelligent reminders and tracking.',
      features: ['Professional invoice templates', 'Recurring billing setup', 'Payment tracking', 'Automated reminders']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Payment Processing',
      description: 'Track all payments, reconcile accounts automatically, and monitor outstanding receivables with smart matching and reconciliation.',
      features: ['Payment tracking', 'Automatic reconciliation', 'Outstanding receivables', 'Payment matching']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Comprehensive Reporting',
      description: 'Generate detailed financial reports, filter data by date or customer, and export everything in Excel or PDF formats for analysis.',
      features: ['Financial reports', 'Date/customer filtering', 'Excel/PDF export', 'Custom report builder']
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Data Import & Migration',
      description: 'Seamlessly import existing offline data from Excel, making the transition from manual processes to digital effortless.',
      features: ['Excel import', 'Data migration', 'Bulk data upload', 'Data validation']
    }
  ]

  const advancedFeatures = [
    {
      title: 'Aging Analysis',
      description: 'Identify overdue payments and prioritize collection efforts with detailed aging reports.',
      icon: '📊'
    },
    {
      title: 'DSO Tracking',
      description: 'Measure collection speed with Days Sales Outstanding metrics to optimize cash flow.',
      icon: '⏱️'
    },
    {
      title: 'Customer Risk Analysis',
      description: 'Rate clients based on payment behavior to make informed credit decisions.',
      icon: '🎯'
    },
    {
      title: 'Collection Effectiveness Index',
      description: 'Evaluate how efficiently your collections team manages outstanding receivables.',
      icon: '📈'
    },
    {
      title: 'Bad Debt Analysis',
      description: 'Estimate potential losses and plan finances better with comprehensive bad debt tracking.',
      icon: '💰'
    },
    {
      title: 'Dispute Resolution',
      description: 'Highlight problematic invoices and resolve disputes quickly with dedicated tools.',
      icon: '🔧'
    }
  ]

  const benefits = [
    { number: '97%', label: 'On-time Payment Rate', description: 'Average improvement in payment collection' },
    { number: '5 min', label: 'Daily Reconciliation', description: 'Time saved with automated processes' },
    { number: '24/7', label: 'Real-time Monitoring', description: 'Continuous financial visibility' },
    { number: '99.9%', label: 'System Uptime', description: 'Reliable cloud infrastructure' }
  ]

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
                Complete Financial Management Solution
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Powerful Features for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Modern Finance Teams
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your financial operations with our comprehensive platform. From automated invoicing to advanced analytics, 
                get everything you need to manage finances efficiently and make smarter business decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap flex-nowrap"
                >
                  Start Free Trial
                  <svg className="ml-2 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 font-semibold rounded-lg transition-all duration-200"
                >
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Core Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage your financial operations with confidence and efficiency.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Analytics Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Advanced Analytics & Insights
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Make data-driven decisions with powerful analytics tools designed for financial professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Smart Automation Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Smart Automation & Notifications
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Stay on top of your finances with intelligent automation and multi-channel notifications.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Email & WhatsApp Reminders</h3>
                      <p className="text-gray-600">Automated smart reminders notify clients about upcoming or overdue payments via email and WhatsApp.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Daily Backups</h3>
                      <p className="text-gray-600">Ensure data safety and reliability with automated daily backups and disaster recovery.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unique ID System</h3>
                      <p className="text-gray-600">Each record gets a unique ID for quick search, reporting, and seamless tracking across all operations.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                  <div className="bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Automation Dashboard</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Email Reminders Sent</span>
                          <span className="text-sm font-medium text-green-400">247</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">WhatsApp Notifications</span>
                          <span className="text-sm font-medium text-blue-400">156</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Auto-Reconciled Payments</span>
                          <span className="text-sm font-medium text-purple-400">89%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{width: '89%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Proven Results
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Join thousands of businesses that have transformed their financial operations with FinFlow.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{benefit.number}</div>
                  <div className="text-lg font-semibold text-blue-100 mb-1">{benefit.label}</div>
                  <div className="text-sm text-blue-200">{benefit.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Financial Management?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience the power of FinFlow's comprehensive features and see how it can streamline your financial operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap flex-nowrap"
              >
                Start Your Free Trial
                <svg className="ml-2 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-all duration-200"
              >
                Schedule a Demo
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}


