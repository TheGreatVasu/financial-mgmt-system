import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Upload, Filter as FilterIcon } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createApiClient } from '../../services/apiClient'

export default function CustomersList() {
  const { token } = useAuthContext()
  const api = useMemo(() => createApiClient(token), [token])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [tier, setTier] = useState('all')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data } = await api.get('/customers')
        const rows = data?.data || []
        if (mounted) setCustomers(rows)
      } catch {
        const fallback = [
          { id: 'c1', name: 'Acme Corp', email: 'billing@acme.com', phone: '+91 99999 11111', tier: 'enterprise', outstanding: 120000 },
          { id: 'c2', name: 'Globex', email: 'accounts@globex.com', phone: '+91 99999 22222', tier: 'business', outstanding: 82000 },
          { id: 'c3', name: 'Initech', email: 'payables@initech.com', phone: '+91 99999 33333', tier: 'startup', outstanding: 64000 },
        ]
        if (mounted) setCustomers(fallback)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [api])

  const filtered = customers.filter(c => {
    const matchQuery = q.trim().length === 0 ? true : (
      c.name?.toLowerCase().includes(q.toLowerCase()) ||
      c.email?.toLowerCase().includes(q.toLowerCase()) ||
      c.phone?.toLowerCase().includes(q.toLowerCase())
    )
    const matchTier = tier === 'all' ? true : c.tier === tier
    return matchQuery && matchTier
  })

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-secondary-600 mt-1">Manage your customer list</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80">
            <Upload className="h-4 w-4" />
            Import
          </button>
          <Link to="/customers/new" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3 mb-4">
          <select value={tier} onChange={(e)=>setTier(e.target.value)} className="input max-w-xs">
            <option value="all">All tiers</option>
            <option value="enterprise">Enterprise</option>
            <option value="business">Business</option>
            <option value="startup">Startup</option>
          </select>
          <input value={q} onChange={(e)=>setQ(e.target.value)} className="input flex-1" placeholder="Search customers..." />
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80">
            <FilterIcon className="h-4 w-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="h-32 rounded-md bg-secondary-100/60 animate-pulse" />
        ) : filtered.length === 0 ? (
          <div className="text-secondary-500 text-sm">No customers found. Try adjusting filters.</div>
        ) : (
          <div className="table-scroll">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-secondary-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Tier</th>
                  <th className="py-2 pr-3">Outstanding</th>
                  <th className="py-2 pr-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-secondary-100/80 hover:bg-secondary-50/70">
                    <td className="py-2 pr-3 font-medium">
                      <Link to={`/customers/${c.id}`} className="text-primary-700 hover:underline">{c.name}</Link>
                    </td>
                    <td className="py-2 pr-3">{c.email}</td>
                    <td className="py-2 pr-3">{c.phone}</td>
                    <td className="py-2 pr-3 capitalize">{c.tier}</td>
                    <td className="py-2 pr-3">₹{(c.outstanding || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2 pr-3"><Link to={`/customers/${c.id}`} className="text-xs text-primary-700 hover:underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

