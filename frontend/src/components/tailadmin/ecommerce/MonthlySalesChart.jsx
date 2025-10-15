import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

export default function MonthlySalesChart({ labels = [], collections = [], invoices = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  function toggleDropdown() {
    setIsOpen(!isOpen)
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
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
          {/* Simple visual placeholder wired to data */}
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-500 text-sm">{labels.length ? labels.join(' • ') : 'No data'}</div>
              <div className="text-xs text-gray-400 mt-1">Collections: {collections.join(', ') || '—'}</div>
              <div className="text-xs text-gray-400 mt-1">Invoices: {invoices.join(', ') || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
