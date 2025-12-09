import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createPOEntryService } from '../../services/poEntryService'
import { Loader2, Search, Plus, FileText, Calendar, DollarSign, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

function Card({ entry }) {
  return (
    <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-secondary-500">PO Number</p>
          <p className="text-lg font-semibold text-secondary-900">{entry.poNo || 'N/A'}</p>
          <p className="text-sm text-secondary-600">{entry.customerName || 'Unknown Customer'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-secondary-500">PO Date</p>
          <p className="text-sm font-medium text-secondary-800">
            {entry.poDate ? new Date(entry.poDate).toLocaleDateString('en-IN') : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-secondary-700">
          <FileText className="h-4 w-4 text-secondary-400" />
          <span>{entry.paymentType || 'Payment type not set'}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary-700">
          <DollarSign className="h-4 w-4 text-secondary-400" />
          <span>
            {entry.totalPOValue != null
              ? `₹${Number(entry.totalPOValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : 'PO value not set'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-secondary-700">
          <Calendar className="h-4 w-4 text-secondary-400" />
          <span>{entry.deliverySchedule || 'No delivery schedule'}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary-700">
          <FileText className="h-4 w-4 text-secondary-400" />
          <span>{entry.businessType || entry.segment || 'Business type not set'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
        <div className="text-xs text-secondary-500">Last updated: {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : '—'}</div>
        <Link
          to={`/po-entry/${entry.id || entry._id || entry.poNo}`}
          className="text-primary-700 text-sm font-semibold hover:text-primary-800 inline-flex items-center gap-1"
        >
          Edit / View
        </Link>
      </div>
    </div>
  )
}

export default function POEntryListPage() {
  const { token } = useAuthContext()
  const poEntryService = useMemo(() => createPOEntryService(token), [token])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!token) return
    load()
  }, [token])

  async function load() {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await poEntryService.list()
      setEntries(res?.data || res || [])
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load PO entries'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const filtered = entries.filter((item) => {
    const hay = `${item.poNo || ''} ${item.customerName || ''} ${item.businessType || ''} ${item.segment || ''}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-secondary-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-secondary-600 mb-1">
                Structured Master Linked Form
              </div>
              <h1 className="text-2xl font-semibold text-secondary-900">PO Entry Records</h1>
              <p className="text-sm text-secondary-600">Browse and manage all recorded purchase orders.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                to="/po-entry/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New PO Entry
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                className="w-full rounded-lg border border-secondary-200 bg-white pl-10 pr-3 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                placeholder="Search by PO number, customer, business type..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-danger-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-secondary-200 bg-white p-8 text-center space-y-3 shadow-sm">
            <FileText className="h-10 w-10 text-secondary-400 mx-auto" />
            <p className="text-lg font-semibold text-secondary-900">No PO entries found</p>
            <p className="text-sm text-secondary-600">Create your first PO entry to get started.</p>
            <div className="flex items-center justify-center gap-2">
              <Link
                to="/po-entry/new"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create PO Entry
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((entry) => (
              <Card key={entry._id || entry.id || entry.poNo} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


