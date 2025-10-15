import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'

export default function CustomersList() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-secondary-600 mt-1">Manage your customer list</p>
        </div>
        <Link to="/customers/new" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors shadow-sm">Add Customer</Link>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <input className="input" placeholder="Search customers..." />
          <button className="btn btn-outline btn-sm">Search</button>
        </div>
        <div className="text-secondary-500 text-sm">No customers yet. This is a placeholder.</div>
      </div>
    </DashboardLayout>
  )
}

