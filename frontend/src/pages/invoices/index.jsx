import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout.jsx'

export default function InvoicesList() {
  return (
    <AppLayout title="Invoices">
      <div className="flex items-center justify-between mb-4">
        <div />
        <button className="btn btn-primary btn-sm">New Invoice</button>
      </div>
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <select className="input max-w-xs">
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <input className="input" placeholder="Search invoices..." />
          <button className="btn btn-outline btn-sm">Filter</button>
        </div>
        <div className="text-secondary-500 text-sm">No invoices yet. This is a placeholder. Try <Link to="/customers" className="underline">adding a customer</Link>.</div>
      </div>
    </AppLayout>
  )
}

