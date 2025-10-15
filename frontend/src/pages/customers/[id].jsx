import { useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'

export default function CustomerDetail() {
  const { id } = useParams()
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Customer Detail</h1>
        <div className="text-sm text-secondary-500 mt-1">ID: {id}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">Customer info placeholder</div>
        <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">Outstanding balance placeholder</div>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">Invoices History placeholder</div>
    </DashboardLayout>
  )
}

