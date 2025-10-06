import Navbar from '../components/layout/Navbar.jsx'
import Footer from '../components/layout/Footer.jsx'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main id="main" className="pt-16">
        <section className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="text-7xl font-bold text-secondary-200">404</div>
          <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
          <p className="mt-2 text-secondary-600">The page you’re looking for doesn’t exist or has been moved.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/" className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700">Go Home</Link>
            <Link to="/contact" className="px-4 py-2 rounded-md border border-secondary-300 hover:bg-secondary-50">Contact Support</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


