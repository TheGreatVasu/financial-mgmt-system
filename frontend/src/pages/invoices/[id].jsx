import { useParams } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout.jsx'

export default function InvoiceDetail() {
  const { id } = useParams()
  return (
    <AppLayout title="Invoice Detail">
      <div className="text-sm text-secondary-500">ID: {id}</div>
      <div className="card p-4">Invoice info placeholder</div>
      <div className="card p-4">Payment history placeholder</div>
    </AppLayout>
  )
}

