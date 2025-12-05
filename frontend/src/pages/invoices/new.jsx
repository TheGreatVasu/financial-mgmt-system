import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createInvoiceService } from '../../services/invoiceService.js'
import MultiStepInvoiceForm from '../../components/invoices/MultiStepInvoiceForm.jsx'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InvoiceNewPage() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const invoiceService = useMemo(() => createInvoiceService(token), [token])

  async function handleSubmit(payload) {
    try {
      await invoiceService.create(payload)
      toast.success('Invoice created successfully!')
      navigate('/invoices')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create invoice'
      toast.error(msg)
      throw err
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <button
              onClick={() => navigate('/invoices')}
              className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-secondary-800 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-secondary-900 text-center">Create New Invoice</h1>
              <p className="text-sm text-secondary-600 text-center">Guided multi-step invoice creation</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <CheckCircle2 className="h-4 w-4 text-success-500" />
              <span>Progress is saved on submission</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <MultiStepInvoiceForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/invoices')}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


