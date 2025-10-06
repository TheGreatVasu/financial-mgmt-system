import { useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout.jsx'

export default function CustomerDetail() {
  const { id } = useParams()
  return (
    <AppLayout title="Customer Detail">
      <div className="text-sm text-secondary-500">ID: {id}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">Customer info placeholder</div>
        <div className="card p-4">Outstanding balance placeholder</div>
      </div>
      <div className="card p-4">Invoices History placeholder</div>
    </AppLayout>
  )
}

