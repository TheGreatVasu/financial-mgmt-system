import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'

export default function CustomerNew() {
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    gstNumber: '',
    city: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.companyName?.trim()) {
      setError('Company name is required')
      return
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Please enter a valid email')
      return
    }
    try {
      setSaving(true)
      const payload = {
        companyName: form.companyName || null,
        name: form.name || null,
        email: form.email || null,
        phone: form.phone || null,
        gstNumber: form.gstNumber || null,
        city: form.city || null,
      }
      const res = await svc.create(payload)
      const created = res?.data
      navigate(`/customers/${created?.id ?? created?._id ?? ''}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Add New Customer</h1>
        <p className="text-sm text-secondary-600 mt-1">Create a customer profile</p>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm mb-1">Company Name</label>
            <input className="input" value={form.companyName} onChange={on('companyName')} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Contact Person</label>
            <input className="input" value={form.name} onChange={on('name')} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input" type="email" value={form.email} onChange={on('email')} placeholder="billing@company.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input className="input" value={form.phone} onChange={on('phone')} placeholder="+91 9xxxxxxxxx" />
          </div>
          <div>
            <label className="block text-sm mb-1">GST Number</label>
            <input className="input" value={form.gstNumber} onChange={on('gstNumber')} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input className="input" value={form.city} onChange={on('city')} placeholder="Optional" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button className="btn btn-primary btn-md" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

