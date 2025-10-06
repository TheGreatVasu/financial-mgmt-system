import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { useToast } from '../components/ui/Toast.jsx'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle')
  const toast = useToast()

  useEffect(() => {
    document.title = 'Contact — RM Project'
  }, [])

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function onSubmit(e) {
    e.preventDefault()
    const emailValid = /.+@.+\..+/.test(form.email)
    if (!form.name || !emailValid || !form.subject || !form.message) {
      toast.add('Please fill all fields with a valid email.', 'error')
      return
    }
    setStatus('success')
    toast.add('Thanks! We’ll be in touch.', 'success')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-white to-primary-50" />
          <div className="relative max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900">Get in touch</h1>
            <p className="mt-2 text-secondary-600 max-w-2xl">We’re here to help—whether you’re looking for support, exploring a demo, or interested in partnership opportunities.</p>
          </div>
        </section>

        {/* Methods + Form */}
        <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-secondary-200 bg-white">
              <div className="font-semibold text-secondary-900">Sales</div>
              <div className="mt-1 text-sm">Talk to our team about RM Project.</div>
              <a className="mt-2 inline-block text-primary-700 hover:underline text-sm" href="mailto:sales@rmproject.com">sales@rmproject.com</a>
            </div>
            <div className="p-6 rounded-xl border border-secondary-200 bg-white">
              <div className="font-semibold text-secondary-900">Support</div>
              <div className="mt-1 text-sm">Need help? We’ll get back within 1 business day.</div>
              <a className="mt-2 inline-block text-primary-700 hover:underline text-sm" href="mailto:support@rmproject.com">support@rmproject.com</a>
            </div>
            <div className="p-6 rounded-xl border border-secondary-200 bg-white">
              <div className="font-semibold text-secondary-900">Partnerships</div>
              <div className="mt-1 text-sm">Let’s explore how we can work together.</div>
              <a className="mt-2 inline-block text-primary-700 hover:underline text-sm" href="mailto:partners@rmproject.com">partners@rmproject.com</a>
            </div>
            <div className="p-6 rounded-xl border border-secondary-200 bg-white">
              <div className="font-semibold text-secondary-900">Head Office</div>
              <div className="mt-2 text-sm text-secondary-700">Bengaluru, India</div>
              <div className="text-sm text-secondary-700">+91 00000 00000</div>
              <div className="mt-4 rounded-xl overflow-hidden border border-secondary-200">
                <iframe title="map" className="w-full h-36" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.078476312796!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE3LjciTiA3N8KwMzUnNDEuNiJF!5e0!3m2!1sen!2sin!4v1700000000000"></iframe>
              </div>
              <div className="mt-2 text-xs text-secondary-500">Mon–Fri, 9:00–18:00 IST</div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-secondary-200 bg-white shadow-soft">
              <div className="p-6">
                <h2 className="text-lg font-semibold">Send us a message</h2>
                <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm mb-1">Name</label>
                    <input name="name" value={form.name} onChange={onChange} type="text" required className="w-full input" placeholder="Your name" />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm mb-1">Email</label>
                    <input name="email" value={form.email} onChange={onChange} type="email" required className="w-full input" placeholder="you@company.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Subject</label>
                    <input name="subject" value={form.subject} onChange={onChange} type="text" required className="w-full input" placeholder="How can we help?" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm mb-1">Message</label>
                    <textarea name="message" value={form.message} onChange={onChange} required className="w-full input min-h-[140px]" placeholder="Write your message..." />
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <button className="btn btn-primary btn-md">Send Message</button>
                    {status === 'success' ? <span className="text-success-700 text-sm">Thanks! We’ll be in touch.</span> : null}
                  </div>
                </form>
              </div>
            </div>

            {/* Mini FAQ */}
            <div className="mt-8 rounded-2xl border border-secondary-200 bg-white">
              <div className="p-6">
                <h3 className="text-base font-semibold">Quick answers</h3>
                <div className="mt-4 divide-y divide-secondary-200">
                  {[{q:'What response time can I expect?',a:'We usually respond within one business day.'},{q:'Do you offer demos?',a:'Yes, schedule a live demo via Sales and we’ll tailor it to your needs.'}].map((f)=> (
                    <details key={f.q} className="group open:bg-secondary-50/50">
                      <summary className="list-none cursor-pointer py-3 flex items-center justify-between"><span className="text-sm font-medium">{f.q}</span><span className="text-secondary-500 group-open:rotate-45 transition-transform">+</span></summary>
                      <div className="pb-3 text-sm text-secondary-700">{f.a}</div>
                    </details>
                  ))}
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


