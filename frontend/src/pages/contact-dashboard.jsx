import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createApiClient } from '../services/apiClient'
import { useAuthContext } from '../context/AuthContext.jsx'

export default function ContactPage() {
  const { token, user } = useAuthContext()
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    subject: '', 
    message: '',
    phone: ''
  })
  const [status, setStatus] = useState('idle') // idle, sending, success, error
  const [error, setError] = useState('')

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setForm(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || prev.name,
        email: user.email || prev.email
      }))
    }
    document.title = 'Contact Us — Financial Management System'
  }, [user])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    
    // Validation
    const emailValid = /.+@.+\..+/.test(form.email)
    if (!form.name || !emailValid || !form.subject || !form.message) {
      setError('Please fill all required fields with a valid email.')
      setStatus('error')
      return
    }

    setStatus('sending')

    try {
      const api = createApiClient(token)
      const { data } = await api.post('/contact', {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject,
        message: form.message
      })

      if (data?.success) {
        setStatus('success')
        // Reset form
        setForm({ name: '', email: '', subject: '', message: '', phone: '' })
        // Reset to idle after 5 seconds
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        throw new Error(data?.message || 'Failed to send message')
      }
    } catch (err) {
      console.error('Contact form error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to send message. Please try again.')
      setStatus('error')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">
            Get in touch with our team. We're here to help with support, sales inquiries, or any questions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-2">Get help via email</p>
                  <a 
                    href="mailto:support@financialmgmt.com" 
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    support@financialmgmt.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-2">Call us during business hours</p>
                  <a 
                    href="tel:+911234567890" 
                    className="text-sm text-green-600 hover:text-green-700 hover:underline"
                  >
                    +91 123 456 7890
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Office Address</h3>
                  <p className="text-sm text-gray-600 mb-2">Visit us at our headquarters</p>
                  <p className="text-sm text-gray-700">
                    123 Business Street<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                  <p className="text-sm text-gray-600 mb-2">When we're available</p>
                  <p className="text-sm text-gray-700">
                    Monday - Friday: 9:00 AM - 6:00 PM IST<br />
                    Saturday: 10:00 AM - 2:00 PM IST<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              
              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Message sent successfully!</p>
                    <p className="text-xs text-green-700 mt-1">We'll get back to you within 1-2 business days.</p>
                  </div>
                </div>
              )}

              {error && status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error sending message</p>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="John Doe"
                      disabled={status === 'sending'}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="you@company.com"
                      disabled={status === 'sending'}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="+91 123 456 7890"
                    disabled={status === 'sending'}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="How can we help you?"
                    disabled={status === 'sending'}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    placeholder="Please provide details about your inquiry..."
                    disabled={status === 'sending'}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                  {status === 'idle' && (
                    <p className="text-xs text-gray-500">
                      We typically respond within 1-2 business days
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="list-none cursor-pointer py-2 flex items-center justify-between text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    <span>What is the typical response time?</span>
                    <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="pt-2 pb-3 text-sm text-gray-600">
                    We usually respond to all inquiries within 1-2 business days. For urgent matters, please call our support line.
                  </div>
                </details>
                <details className="group">
                  <summary className="list-none cursor-pointer py-2 flex items-center justify-between text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    <span>Do you offer product demos?</span>
                    <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="pt-2 pb-3 text-sm text-gray-600">
                    Yes! Contact our sales team to schedule a personalized demo tailored to your business needs.
                  </div>
                </details>
                <details className="group">
                  <summary className="list-none cursor-pointer py-2 flex items-center justify-between text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    <span>How can I upgrade my subscription plan?</span>
                    <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="pt-2 pb-3 text-sm text-gray-600">
                    You can upgrade your plan anytime from the Subscription page. Changes take effect immediately.
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

