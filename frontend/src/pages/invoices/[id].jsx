import { useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'

export default function InvoiceDetail() {
  const { id } = useParams()
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Invoice Detail</h1>
        <div className="text-sm text-secondary-500 mt-1">ID: {id}</div>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">Invoice info placeholder</div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">Payment history placeholder</div>
    </DashboardLayout>
  )
}

