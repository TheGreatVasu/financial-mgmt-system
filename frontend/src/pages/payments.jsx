import AppLayout from '../components/layout/AppLayout.jsx'

export default function PaymentsPage() {
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
    <AppLayout title="Payments">
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
    </AppLayout>
  )
}


