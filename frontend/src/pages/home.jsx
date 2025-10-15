import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { submitContact } from '../services/publicService'
import ProductVideo from '../components/sections/ProductVideo.jsx'

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
      toast.add('Message sent! We\'ll be in touch.', 'success')
      e.currentTarget.reset()
    } catch (err) {
      toast.add('Failed to send message. Try again later.', 'error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main id="main" className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Trusted by 500+ businesses
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                  Financial Management
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Made Simple
                  </span>
                </h1>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Streamline your business finances with our all-in-one platform. From invoicing to analytics, 
                  get complete control over your cash flow with enterprise-grade security.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap flex-nowrap"
                  >
                    Start Free Trial
                    <svg className="ml-2 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 font-semibold rounded-lg transition-all duration-200"
                  >
                    View Demo
                  </Link>
                </div>
                <div className="flex items-center space-x-6 text-sm text-slate-400">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    14-day free trial
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Dashboard Overview</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">₹2.4M</div>
                          <div className="text-sm text-gray-600">Total Revenue</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">₹1.8M</div>
                          <div className="text-sm text-gray-600">Cash Flow</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Pending Invoices</span>
                          <span className="text-sm font-medium text-orange-600">12</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Video Section */}
        <ProductVideo
          title="See FinFlow in Action"
          subtitle="Get a quick overview of how FinFlow helps you track finances, automate invoices, and make data-driven business decisions — all in one place."
          videoSrc="/demo.mp4"
          ctaHref="/signup"
          ctaText="Start Free Trial"
        />

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Manage Your Business Finances
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From invoicing to analytics, our comprehensive platform gives you complete control 
                over your financial operations with enterprise-grade security.
              </p>
          </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: 'Real-Time Analytics',
                  desc: 'Get instant insights with live dashboards, customizable KPIs, and automated alerts to track your business performance.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  title: 'Bank-Grade Security',
                  desc: 'Enterprise-level security with role-based access control, end-to-end encryption, and comprehensive audit trails.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: 'Smart Invoicing',
                  desc: 'Create professional invoices, set up recurring billing, and automate payment collection with smart reminders.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: 'Payment Tracking',
                  desc: 'Monitor all payments, reconcile accounts, and track outstanding receivables with automated matching.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: 'Financial Reports',
                  desc: 'Generate comprehensive reports, export to PDF/Excel, and get insights into your business performance.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: 'Team Collaboration',
                  desc: 'Work together with your team using role-based permissions and real-time collaboration features.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trusted by Businesses Worldwide
              </h2>
              <p className="text-xl text-gray-600">
                See what our customers say about RM Project
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "CFO, TechStart Inc.",
                  content: "RM Project transformed our financial management. We reduced invoice processing time by 70% and improved cash flow visibility significantly.",
                  rating: 5,
                  avatar: "SC"
                },
                {
                  name: "Michael Rodriguez",
                  role: "Finance Director, GlobalCorp",
                  content: "The real-time analytics and automated reporting features have been game-changers for our team. Highly recommend!",
                  rating: 5,
                  avatar: "MR"
                },
                {
                  name: "Priya Sharma",
                  role: "Founder, Growth Ventures",
                  content: "Finally, a financial platform that's both powerful and easy to use. The security features give us peace of mind.",
                  rating: 5,
                  avatar: "PS"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                See RM Project in Action
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the power of our unified platform with real-time visibility across all your financial operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-8">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ),
                      title: "Real-Time Revenue Tracking",
                      desc: "Monitor your income streams with live dashboards and automated alerts."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ),
                      title: "Automated Invoicing",
                      desc: "Create, send, and track invoices with smart reminders and payment collection."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ),
                      title: "Smart Financial Reports",
                      desc: "Generate comprehensive reports and export to PDF/Excel with one click."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ),
                      title: "Enterprise Security",
                      desc: "Bank-grade security with role-based access and complete audit trails."
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.desc}</p>
                      </div>
                </div>
              ))}
            </div>
                <div className="mt-8">
                  <Link 
                    to="/signup" 
                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap flex-nowrap"
                  >
                    Start Your Free Trial
                    <svg className="ml-2 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                  <div className="bg-gray-900 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Dashboard Preview</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                          <div className="text-2xl font-bold text-blue-400">₹2.4M</div>
                          <div className="text-sm text-gray-300">Total Revenue</div>
                        </div>
                        <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
                          <div className="text-2xl font-bold text-green-400">₹1.8M</div>
                          <div className="text-sm text-gray-300">Cash Flow</div>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Pending Invoices</span>
                          <span className="text-sm font-medium text-orange-400">12</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-300">Overdue Payments</span>
                          <span className="text-sm font-medium text-red-400">3</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-red-400 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of businesses already using RM Project
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  step: '1', 
                  title: 'Sign Up & Setup', 
                  desc: 'Create your account in minutes and add your business details. Import existing data or start fresh.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )
                },
                { 
                  step: '2', 
                  title: 'Connect & Import', 
                  desc: 'Connect your bank accounts, import existing invoices, and set up your customer database.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )
                },
                { 
                  step: '3', 
                  title: 'Start Managing', 
                  desc: 'Begin tracking finances, creating invoices, and collaborating with your team in real-time.',
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
              ].map((s, index) => (
                <div key={s.step} className="text-center relative">
                  <div className="relative">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                      {s.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 transform translate-x-4">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600">
                Choose the perfect plan for your business. No hidden fees, cancel anytime.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { 
                  name: 'Starter', 
                  price: '₹0', 
                  period: '/month', 
                  description: 'Perfect for small businesses getting started',
                  features: [
                    'Up to 100 invoices per month',
                    'Basic analytics dashboard',
                    '1 user account',
                    'Email support',
                    'PDF export',
                    'Mobile app access'
                  ],
                  cta: 'Start Free Trial',
                  popular: false
                },
                { 
                  name: 'Professional', 
                  price: '₹9999', 
                  period: '/month', 
                  description: 'Most popular for growing businesses',
                  features: [
                    'Unlimited invoices',
                    'Advanced analytics & reports',
                    'Up to 5 user accounts',
                    'Priority email support',
                    'PDF & Excel export',
                    'Automated invoicing',
                    'Payment tracking',
                    'WhatsApp notifications'
                  ],
                  cta: 'Start Free Trial',
                  popular: true
                },
                { 
                  name: 'Enterprise', 
                  price: 'Custom', 
                  period: '', 
                  description: 'For large organizations with complex needs',
                  features: [
                    'Everything in Professional',
                    'Unlimited users',
                    'Custom integrations',
                    'Dedicated account manager',
                    '24/7 phone support',
                    'Custom reporting',
                    'API access',
                    'On-premise deployment'
                  ],
                  cta: 'Contact Sales',
                  popular: false
                },
              ].map((plan, idx) => (
                <div key={plan.name} className={`relative rounded-2xl border-2 p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${plan.popular ? 'border-blue-500 ring-4 ring-blue-100' : 'border-gray-200'} flex flex-col`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to={plan.name === 'Enterprise' ? '/contact' : '/signup'} 
                    className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap flex-nowrap mt-auto ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    {plan.cta}
                    <svg className="ml-2 w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Financial Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of businesses already using RM Project to streamline their finances and grow faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg whitespace-nowrap flex-nowrap"
              >
                Start Your Free Trial
                <svg className="ml-2 w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-600">
                Have questions? We're here to help. Reach out for support, sales, or partnership inquiries.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <form onSubmit={onSubscribe} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input 
                        name="name" 
                        type="text" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="Your name" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        placeholder="you@company.com" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input 
                      name="company" 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Your company name" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea 
                      name="message" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]" 
                      placeholder="How can we help you?" 
                      required 
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Send Message
                  </button>
                </form>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-blue-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Office Address</div>
                        <div className="text-gray-600">Bengaluru, Karnataka, India</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-blue-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <a href="mailto:support@rmproject.com" className="text-blue-600 hover:underline">support@rmproject.com</a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-blue-600 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Phone</div>
                        <a href="tel:+910000000000" className="text-blue-600 hover:underline">+91 00000 00000</a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


