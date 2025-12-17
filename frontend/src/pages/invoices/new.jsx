import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createInvoiceService } from '../../services/invoiceService.js'
import MultiStepInvoiceForm from '../../components/invoices/MultiStepInvoiceForm.jsx'
import { ArrowLeft, CheckCircle2, Eye, Edit, Trash2, Calendar, DollarSign, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function InvoiceNewPage() {
  const { token } = useAuthContext()
  const navigate = useNavigate()
  const invoiceService = useMemo(() => createInvoiceService(token), [token])
  const [createdInvoice, setCreatedInvoice] = useState(null)

  async function handleSubmit(payload) {
    try {
      const response = await invoiceService.create(payload)
      const invoice = response?.data || response
      setCreatedInvoice(invoice)
      toast.success('Invoice created successfully!')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create invoice'
      toast.error(msg)
      throw err
    }
  }

  function InvoicePreviewCard({ invoice }) {
    const issueDate = invoice.issueDate || invoice.issue_date || invoice.gstTaxInvoiceDate
    const dueDate = invoice.dueDate || invoice.due_date || invoice.firstDueDate
    const amount = invoice.totalAmount || invoice.total_amount || invoice.totalInvoiceValue || 0
    
    return (
      <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary-500">Invoice</p>
            <p className="text-lg font-semibold text-secondary-900">
              {invoice.invoiceNumber || invoice.invoice_number || invoice.gstTaxInvoiceNo || 'N/A'}
            </p>
            <p className="text-sm text-secondary-600">
              {invoice.customerName || invoice.customer_name || 'Unknown Customer'}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-success-100 text-success-700 border-success-200">
            Created
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-secondary-700">
            <DollarSign className="h-4 w-4 text-secondary-400" />
            <span>₹{Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center gap-2 text-secondary-700">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span>Issue: {issueDate ? (issueDate.includes('T') ? issueDate.split('T')[0] : issueDate).split(' ')[0] : '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-secondary-700">
            <Calendar className="h-4 w-4 text-secondary-400" />
            <span>Due: {dueDate ? (dueDate.includes('T') ? dueDate.split('T')[0] : dueDate).split(' ')[0] : '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-secondary-700">
            <FileText className="h-4 w-4 text-secondary-400" />
            <span>{invoice.paymentTerms || invoice.payment_terms || 'Payment terms not set'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
          <div className="text-xs text-secondary-500">
            Created: {new Date().toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/invoices/${invoice.id || invoice._id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
            <Link
              to={`/invoices/${invoice.id || invoice._id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 hover:border-primary-300 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => navigate('/invoices')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-1.5 text-sm font-semibold text-danger-600 hover:bg-danger-100 hover:border-danger-300 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>
    )
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

        {createdInvoice ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-success-200 bg-success-50 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success-600" />
              <div>
                <p className="text-sm font-semibold text-success-900">Invoice created successfully!</p>
                <p className="text-xs text-success-700">Your invoice has been saved and is ready to view.</p>
              </div>
            </div>
            <InvoicePreviewCard invoice={createdInvoice} />
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/invoices')}
                className="btn btn-primary btn-md"
              >
                View All Invoices
              </button>
              <button
                onClick={() => {
                  setCreatedInvoice(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="btn btn-outline btn-md"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-content">
              <MultiStepInvoiceForm
                onSubmit={handleSubmit}
                onCancel={() => navigate('/invoices')}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


