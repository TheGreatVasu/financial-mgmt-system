export default function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-14">
        {/* Top: Brand + Nav + Subscribe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-lg bg-primary-600 text-white text-sm font-semibold">RM</div>
              <span className="text-lg font-semibold">RM Project</span>
            </div>
            <p className="mt-4 text-sm text-white/80 leading-6">
              RM Project helps you manage finances efficiently with real‑time insights
              and powerful tools for invoicing, reporting, and cash flow planning.
            </p>
            <div className="mt-4 flex items-center gap-3 text-white/80">
              <a aria-label="LinkedIn" className="hover:text-white" href="#">In</a>
              <a aria-label="Twitter" className="hover:text-white" href="#">Tw</a>
              <a aria-label="GitHub" className="hover:text-white" href="#">Gh</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-white/70">Quick Links</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="hover:underline hover:text-primary-300" href="/">Home</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="/dashboard">Dashboard</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="/features">Features</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="/pricing">Pricing</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="/contact">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-white/70">Resources</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="hover:underline hover:text-primary-300" href="#">Privacy Policy</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="#">Terms of Service</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="#">FAQs</a></li>
              <li><a className="hover:underline hover:text-primary-300" href="#">Support</a></li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <div className="text-sm font-semibold tracking-wide uppercase text-white/70">Subscribe</div>
            <p className="mt-4 text-sm text-white/80">Get product updates and insights straight to your inbox.</p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" required placeholder="Enter your email" className="flex-1 px-3 py-2 rounded-md bg-white text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-600" />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </form>
            <div className="mt-2 text-xs text-white/60">We care about your data. Read our <a className="underline hover:text-white" href="#">Privacy Policy</a>.</div>
          </div>
        </div>

        {/* Bottom: Legal */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <div>© 2025 RM Project. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href="#">Privacy</a>
            <a className="hover:text-white" href="#">Terms</a>
            <a className="hover:text-white" href="#">Security</a>
            <a className="hover:text-white" href="#">Status</a>
          </div>
        </div>
      </div>
    </footer>
  )
}


