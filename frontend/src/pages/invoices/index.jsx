import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'

export default function InvoicesList() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-secondary-600 mt-1">Track and manage invoices</p>
        </div>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors shadow-sm">New Invoice</button>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
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
    </DashboardLayout>
  )
}

