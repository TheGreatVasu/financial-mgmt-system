import DashboardLayout from '../components/layout/DashboardLayout'
import React from 'react'
import Modal from '../components/ui/Modal.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { createMOMService } from '../services/momService'

export default function PaymentsPage() {
  const { token } = useAuthContext()
  const momApi = React.useMemo(() => createMOMService(token), [token])
  const [momOpen, setMomOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [moms, setMoms] = React.useState([])
  const [meta, setMeta] = React.useState({ page: 1, limit: 12, total: 0 })
  const [filters, setFilters] = React.useState({ q: '', status: '', from: '', to: '' })
  const [form, setForm] = React.useState(defaultForm())
  const [editingId, setEditingId] = React.useState(null)

  const smart = React.useMemo(() => {
    const amount = Number(form.paymentAmount || 0)
    const rate = Number(form.interestRate || 0)
    const due = form.dueDate ? new Date(form.dueDate) : null
    const today = new Date()
    let computedInterest = 0
    if (due && today > due && rate > 0) {
      const daysLate = Math.floor((today - due) / (24*60*60*1000))
      computedInterest = Math.round(((amount * (rate/100)) / 30) * daysLate * 100) / 100
    }
    return { totalPayable: amount + computedInterest, pendingDues: amount, computedInterest }
  }, [form.paymentAmount, form.interestRate, form.dueDate])

  const debounced = useDebounce(filters, 400)

  async function load(page = meta.page) {
    setLoading(true)
    try {
      const { data, meta: m } = await momApi.list({ ...debounced, page, limit: meta.limit })
      setMoms(data)
      if (m) setMeta(m)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { if (token) load(1) }, [token, debounced.q, debounced.status, debounced.from, debounced.to])

  async function submitMOM(e) {
    e?.preventDefault?.()
    const payload = {
      ...form,
      meetingDate: new Date(form.meetingDate),
      participants: form.participants.split(',').map(s => s.trim()).filter(Boolean),
      paymentAmount: Number(form.paymentAmount),
      interestRate: Number(form.interestRate),
      aiSummary: undefined,
    }
    if (editingId) {
      await momApi.update(editingId, payload)
    } else {
      await momApi.create(payload)
    }
    closeModal()
    load()
  }

  function closeModal() {
    setMomOpen(false)
    setEditingId(null)
    setForm(defaultForm())
  }

  function onEdit(m) {
    setEditingId(m._id)
    setForm({
      meetingTitle: m.meetingTitle || '',
      meetingDate: new Date(m.meetingDate).toISOString().slice(0,10),
      participants: (m.participants || []).join(', '),
      agenda: m.agenda || '',
      discussionNotes: m.discussionNotes || '',
      agreedPaymentTerms: m.agreedPaymentTerms || '',
      paymentAmount: m.paymentAmount ?? 0,
      dueDate: m.dueDate ? new Date(m.dueDate).toISOString().slice(0,10) : '',
      paymentType: m.paymentType || 'milestone',
      interestRate: m.interestRate ?? 0,
      status: m.status || 'planned'
    })
    setMomOpen(true)
  }

  async function onDelete(id) {
    if (!confirm('Delete this MOM?')) return
    await momApi.remove(id)
    load()
  }

  async function quickStatus(id, status) {
    await momApi.update(id, { status })
    load()
  }
  const rows = [
    { id: 'PMT-0001', customer: 'Acme Corp', method: 'UPI', amount: '₹ 45,000', date: '2025-10-01', status: 'Settled' },
    { id: 'PMT-0002', customer: 'Globex', method: 'Card', amount: '₹ 90,000', date: '2025-10-04', status: 'Failed' },
    { id: 'PMT-0003', customer: 'Initech', method: 'NetBanking', amount: '₹ 60,000', date: '2025-10-06', status: 'Pending' },
  ]
  const [query, setQuery] = React.useState('')
  const [sortBy, setSortBy] = React.useState('date')
  const [page, setPage] = React.useState(1)
  const pageSize = 5

  const filtered = rows.filter((r) =>
    [r.id, r.customer, r.method, r.amount, r.date, r.status].join(' ').toLowerCase().includes(query.toLowerCase())
  )
  const sorted = [...filtered].sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <DashboardLayout>
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
          <div className="flex items-center gap-2">
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search payments" className="input" />
            <select className="input w-auto" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date</option>
              <option value="customer">Customer</option>
              <option value="status">Status</option>
            </select>
            <button className="btn btn-outline btn-sm">Export</button>
            <button className="btn btn-primary btn-md" onClick={() => setMomOpen(true)}>Create MOM</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-secondary-600">
                <th className="py-2 pr-4">Payment ID</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-t border-secondary-200">
                  <td className="py-2 pr-4">{r.id}</td>
                  <td className="py-2 pr-4">{r.customer}</td>
                  <td className="py-2 pr-4">{r.method}</td>
                  <td className="py-2 pr-4">{r.amount}</td>
                  <td className="py-2 pr-4">{r.date}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs ${r.status === 'Settled' ? 'bg-success-100 text-success-700' : r.status === 'Failed' ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-700'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div>Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <button className="btn btn-outline btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </section>

      <section className="card p-6 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Meeting MOMs</h3>
          <div className="flex items-center gap-2">
            <input className="input" placeholder="Search MOM" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
            <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="planned">Planned</option>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <input type="date" className="input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
            <input type="date" className="input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
            <button className="btn btn-outline btn-sm" onClick={() => load(1)}>Apply</button>
          </div>
        </div>
        {loading ? (
          <div className="mt-6 text-sm text-secondary-600">Loading...</div>
        ) : moms.length === 0 ? (
          <div className="mt-6 text-sm text-secondary-600">No MOMs found.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moms.map(m => (
              <div key={m._id} className="rounded-lg border border-secondary-200 p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{m.meetingTitle}</div>
                  <StatusPill status={m.status} />
                </div>
                <div className="text-xs text-secondary-600 mt-1">{new Date(m.meetingDate).toDateString()}</div>
                <div className="mt-3 text-sm line-clamp-2">{m.aiSummary || m.agreedPaymentTerms}</div>
                <div className="mt-3 text-xs text-secondary-600">Due: {m.dueDate ? new Date(m.dueDate).toDateString() : '—'}</div>
                <div className="mt-2 text-sm">Total Payable: ₹{(m.smart?.totalPayable ?? m.paymentAmount).toLocaleString('en-IN')}</div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => onEdit(m)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => onDelete(m._id)}>Delete</button>
                  <div className="ml-auto inline-flex gap-1">
                    <button className="btn btn-ghost btn-sm" onClick={() => quickStatus(m._id, 'paid')}>Mark Paid</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => quickStatus(m._id, 'due')}>Mark Due</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => quickStatus(m._id, 'overdue')}>Overdue</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm">
          <div>Page {meta.page} of {Math.max(1, Math.ceil(meta.total / meta.limit))}</div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline btn-sm" disabled={meta.page <= 1} onClick={() => load(Math.max(1, meta.page - 1))}>Prev</button>
            <button className="btn btn-outline btn-sm" disabled={meta.page >= Math.ceil((meta.total || 0) / meta.limit)} onClick={() => load(meta.page + 1)}>Next</button>
          </div>
        </div>
      </section>

      <section className="card p-6 mt-6">
        <h3 className="text-base font-semibold">Calendar</h3>
        <Calendar events={moms} onSelect={(m) => onEdit(m)} />
      </section>

      <Timeline moms={moms} />

      <Modal open={momOpen} onClose={closeModal} title={editingId ? 'Edit Payment MOM' : 'Create Payment MOM'} variant="dialog" size="lg" footer={(
        <>
          <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" onClick={submitMOM} disabled={!form.meetingTitle || !form.meetingDate}>Save MOM</button>
        </>
      )}>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submitMOM}>
          <div>
            <label className="label">Meeting Title</label>
            <input className="input" value={form.meetingTitle} onChange={(e) => setForm({ ...form, meetingTitle: e.target.value })} required />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Participants</label>
            <input className="input" placeholder="Comma separated" value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Agenda</label>
            <input className="input" value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Discussion Notes</label>
            <textarea className="input" rows={3} value={form.discussionNotes} onChange={(e) => setForm({ ...form, discussionNotes: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Agreed Payment Terms</label>
            <textarea className="input" rows={2} value={form.agreedPaymentTerms} onChange={(e) => setForm({ ...form, agreedPaymentTerms: e.target.value })} />
          </div>
          <div>
            <label className="label">Payment Amount</label>
            <input type="number" className="input" value={form.paymentAmount} onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })} />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Payment Type</label>
            <select className="input" value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
              <option value="advance">Advance</option>
              <option value="milestone">Milestone</option>
              <option value="final">Final</option>
              <option value="refund">Refund</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Interest Rate (%)</label>
            <input type="number" className="input" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="planned">Planned</option>
              <option value="due">Due</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-lg border border-secondary-200 p-4 bg-secondary-50">
              <div className="text-sm font-semibold mb-2">Smart Calculation</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>Total Payable: <span className="font-medium">₹{smart.totalPayable.toLocaleString('en-IN')}</span></div>
                <div>Pending Dues: <span className="font-medium">₹{smart.pendingDues.toLocaleString('en-IN')}</span></div>
                <div>Interest: <span className="font-medium">₹{smart.computedInterest.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

function StatusPill({ status }) {
  const map = {
    planned: 'bg-secondary-100 text-secondary-700',
    due: 'bg-warning-100 text-warning-700',
    paid: 'bg-success-100 text-success-700',
    overdue: 'bg-danger-100 text-danger-700',
    cancelled: 'bg-secondary-100 text-secondary-700'
  }
  return <span className={`text-xs px-2 py-1 rounded ${map[status] || 'bg-secondary-100 text-secondary-700'}`}>{status}</span>
}

function Calendar({ events, onSelect }) {
  const today = new Date()
  const [month, setMonth] = React.useState(today.getMonth())
  const [year, setYear] = React.useState(today.getFullYear())
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  const daysInMonth = end.getDate()
  const startWeekday = (start.getDay() + 6) % 7 // make Monday=0

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  function eventsOn(date) {
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate()
    return events.filter(e => {
      const md = new Date(e.meetingDate)
      const dd = e.dueDate ? new Date(e.dueDate) : null
      const isMeeting = md.getFullYear() === y && md.getMonth() === m && md.getDate() === d
      const isDue = dd && dd.getFullYear() === y && dd.getMonth() === m && dd.getDate() === d
      return isMeeting || isDue
    }).slice(0, 3)
  }

  function prevMonth() {
    const dt = new Date(year, month - 1, 1)
    setMonth(dt.getMonth()); setYear(dt.getFullYear())
  }
  function nextMonth() {
    const dt = new Date(year, month + 1, 1)
    setMonth(dt.getMonth()); setYear(dt.getFullYear())
  }

  const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(year, month))

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{monthName} {year}</div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={prevMonth}>Prev</button>
          <button className="btn btn-outline btn-sm" onClick={nextMonth}>Next</button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2 text-xs">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-secondary-500">{d}</div>)}
        {cells.map((date, idx) => (
          <div key={idx} className={`min-h-[84px] rounded border border-secondary-200 p-2 ${date && date.toDateString() === today.toDateString() ? 'bg-primary-50' : 'bg-white'}`}>
            <div className="text-[11px] text-secondary-500">{date ? date.getDate() : ''}</div>
            <div className="mt-1 space-y-1">
              {date ? eventsOn(date).map(ev => (
                <button key={ev._id} className="text-left w-full text-[11px] px-1.5 py-0.5 rounded bg-secondary-100 hover:bg-secondary-200" onClick={() => onSelect?.(ev)}>
                  {ev.meetingTitle}
                </button>
              )) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Timeline({ moms }) {
  const items = [...moms].sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate))
  return (
    <section className="card p-6 mt-6">
      <h3 className="text-base font-semibold">Timeline</h3>
      <div className="mt-4 space-y-4">
        {items.map(m => (
          <div key={m._id} className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
            <div className="flex-1">
              <div className="text-sm font-medium">{m.meetingTitle} <span className="text-xs text-secondary-600">{new Date(m.meetingDate).toDateString()}</span></div>
              <div className="text-xs text-secondary-600">{m.aiSummary || m.agreedPaymentTerms}</div>
            </div>
            <StatusPill status={m.status} />
          </div>
        ))}
      </div>
    </section>
  )
}

function defaultForm() {
  return { meetingTitle: '', meetingDate: new Date().toISOString().slice(0,10), participants: '', agenda: '', discussionNotes: '', agreedPaymentTerms: '', paymentAmount: 0, dueDate: '', paymentType: 'milestone', interestRate: 0, status: 'planned' }
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}


