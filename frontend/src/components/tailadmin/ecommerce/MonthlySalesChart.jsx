import { useMemo, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function MonthlySalesChart({ labels = [], collections = [], invoices = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  const maxY = useMemo(() => Math.max(1, ...collections, ...invoices), [collections, invoices])
  const points = useMemo(() => {
    const n = Math.max(collections.length, invoices.length)
    return Array.from({ length: n }).map((_, i) => ({
      c: Number(collections[i] || 0),
      v: Number(invoices[i] || 0),
    }))
  }, [collections, invoices])

  return (
    <div className="overflow-hidden rounded-2xl border border-primary-200/60 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Collections vs Invoices</h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreHorizontal className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  View More
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <svg viewBox="0 0 640 240" className="w-full h-56">
            <defs>
              <linearGradient id="gradC" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradV" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
              </linearGradient>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#60a5fa" floodOpacity="0.45" />
              </filter>
            </defs>
            <g transform="translate(32 16)">
              <rect x="0" y="0" width="576" height="192" rx="10" fill="#f8fafc" />
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={i} x1="0" x2="576" y1={i * 48} y2={i * 48} stroke="#e2e8f0" strokeDasharray="4 6" />
              ))}
              {/* Lines */}
              {(() => {
                const width = 576
                const height = 192
                const pad = 8
                const x = (i) => (i * (width - pad * 2)) / Math.max(1, points.length - 1) + pad
                const y = (v) => height - pad - (v / maxY) * (height - pad * 2)
                const dC = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.c)}`).join(' ')
                const dV = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.v)}`).join(' ')
                return (
                  <>
                    <path d={dC} fill="none" stroke="#3b82f6" strokeWidth="2.5" style={{ filter: 'url(#softGlow)' }} />
                    <path d={`${dC} L ${x(points.length - 1)} ${height - pad} L ${x(0)} ${height - pad} Z`} fill="url(#gradC)" />
                    <path d={dV} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    <path d={`${dV} L ${x(points.length - 1)} ${height - pad} L ${x(0)} ${height - pad} Z`} fill="url(#gradV)" />
                  </>
                )
              })()}
            </g>
          </svg>
          <div className="mt-2 flex items-center justify-between text-xs text-secondary-500">
            <div className="truncate">{labels.length ? labels.join(' • ') : 'No data'}</div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary-500" /> Collections</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Invoices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
