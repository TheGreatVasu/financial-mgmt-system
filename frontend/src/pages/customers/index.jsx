import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout.jsx'

export default function CustomersList() {
  return (
    <AppLayout title="Customers">
      <div className="flex items-center justify-between mb-4">
        <div />
        <Link to="/customers/new" className="btn btn-primary btn-sm">Add Customer</Link>
      </div>
      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <input className="input" placeholder="Search customers..." />
          <button className="btn btn-outline btn-sm">Search</button>
        </div>
        <div className="text-secondary-500 text-sm">No customers yet. This is a placeholder.</div>
      </div>
    </AppLayout>
  )
}

