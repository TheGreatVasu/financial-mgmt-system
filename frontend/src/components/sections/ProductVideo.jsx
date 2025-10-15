import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ProductVideo({ title = 'See FinFlow in Action', subtitle = 'Get a quick overview of how FinFlow helps you track finances, automate invoices, and make data-driven business decisions — all in one place.', videoSrc = '/demo.mp4', ctaHref = '/signup', ctaText = 'Start Free Trial' }) {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <motion.div className="lg:col-span-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          <p className="mt-4 text-gray-600 text-lg">{subtitle}</p>
          <div className="mt-6">
            <Link to={ctaHref} className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-all">
              {ctaText}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </motion.div>

        <motion.div className="lg:col-span-7 relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
          <div className="absolute -inset-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-white/60 backdrop-blur">
            <VideoFrame videoSrc={videoSrc} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function VideoFrame({ videoSrc }) {
  // Support MP4 or YouTube link; if YouTube, use iframe
  const isYouTube = typeof videoSrc === 'string' && videoSrc.includes('youtube.com')
  const isVimeo = typeof videoSrc === 'string' && videoSrc.includes('vimeo.com')
  if (isYouTube || isVimeo) {
    const url = isYouTube ? `${videoSrc}${videoSrc.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=1&rel=0` : `${videoSrc}`
    return (
      <div className="aspect-video">
        <iframe className="w-full h-full" src={url} title="FinFlow Product Video" allow="autoplay; encrypted-media" allowFullScreen />
      </div>
    )
  }
  return (
    <div className="group aspect-video relative">
      <video className="w-full h-full object-cover" src={videoSrc} autoPlay muted loop playsInline />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 group-hover:ring-black/10 transition" />
    </div>
  )
}


