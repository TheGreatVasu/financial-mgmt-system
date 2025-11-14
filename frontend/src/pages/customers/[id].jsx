import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState(null)
  const [form, setForm] = useState({ name: '', companyName: '', email: '', phone: '', gstNumber: '' })

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await svc.get(id)
        const c = res?.data
        if (mounted) {
          setCustomer(c)
          setForm({
            name: c?.name || '',
            companyName: c?.company_name || c?.companyName || '',
            email: c?.email || '',
            phone: c?.phone || '',
            gstNumber: c?.gst_number || c?.gstNumber || '',
          })
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load customer')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id, svc])

  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSave(e) {
    e.preventDefault()
    setError('')
    if (!form.companyName?.trim()) {
      setError('Company name is required')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name || null,
        companyName: form.companyName || null,
        email: form.email || null,
        phone: form.phone || null,
        gstNumber: form.gstNumber || null,
      }
      const res = await svc.update(id, payload)
      const c = res?.data
      setCustomer(c)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update customer')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-32 rounded-md bg-secondary-100/60 animate-pulse" />
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-sm text-secondary-600">Customer not found.</div>
        <button className="btn btn-secondary mt-3" onClick={() => navigate('/customers')}>Back to customers</button>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{form.companyName || 'Customer'} </h1>
        <div className="text-sm text-secondary-500 mt-1">ID: {id}</div>
      </div>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-3">Customer info</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSave}>
            <div>
              <label className="block text-sm mb-1">Company Name</label>
              <input className="input" value={form.companyName} onChange={on('companyName')} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Contact Person</label>
              <input className="input" value={form.name} onChange={on('name')} />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input className="input" value={form.email} onChange={on('email')} type="email" />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input className="input" value={form.phone} onChange={on('phone')} />
            </div>
            <div>
              <label className="block text-sm mb-1">GST Number</label>
              <input className="input" value={form.gstNumber} onChange={on('gstNumber')} />
            </div>
            <div className="md:col-span-2 mt-2">
              <button className="btn btn-primary btn-md" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
        <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
          <h3 className="font-medium mb-3">Outstanding balance</h3>
          <div className="text-2xl font-semibold">₹{(customer?.outstanding || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm mt-4">
        <h3 className="font-medium mb-3">Invoices</h3>
        <div className="text-sm text-secondary-500">Coming soon</div>
      </div>
    </DashboardLayout>
  )
}

