import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import SmartDropdown from '../../components/ui/SmartDropdown.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createPaymentService } from '../../services/paymentService'
import { getSalesInvoiceDashboard } from '../../services/salesInvoiceService'
import { createInvoiceService } from '../../services/invoiceService.js'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PaymentNewPage() {
  const navigate = useNavigate()
  const { token } = useAuthContext()
  const paymentApi = useMemo(() => createPaymentService(token), [token])

  const [invoices, setInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState([defaultForm()])

  useEffect(() => {
    if (token) {
      loadInvoices()
    }
  }, [token])

  async function loadInvoices() {
    if (!token) return
    setInvoicesLoading(true)
    try {
      const invoiceApi = createInvoiceService(token)

      const [dashboardData, simpleInvoicesResponse] = await Promise.all([
        getSalesInvoiceDashboard(token),
        invoiceApi.list({ limit: 100 }),
      ])

      const dashboardInvoices = dashboardData?.data?.invoices || []
      const simpleInvoices = simpleInvoicesResponse?.data || []

      // Merge legacy sales invoices and new app invoices using a common identifier
      const merged = mergeInvoicesByNumber(dashboardInvoices, simpleInvoices)
      setInvoices(merged)
    } catch (err) {
      console.error('Failed to load invoices:', err)
      toast.error('Failed to load invoices')
    } finally {
      setInvoicesLoading(false)
    }
  }

  function updateEntry(index, patch) {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
    )
  }

  function addEntry() {
    setEntries((prev) => [...prev, defaultForm()])
  }

  function removeEntry(index) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function onInvoiceSelect(index, invoiceId) {
    const invoice = invoices.find(
      (inv) => getInvoiceIdentifier(inv) === invoiceId
    )

    if (invoice) {
      updateEntry(index, {
        // Always store the canonical invoice identifier so backend can resolve it
        invoiceId: getInvoiceIdentifier(invoice),
        customerName:
          invoice.customer_name ||
          invoice.customerName ||
          invoice.customer?.companyName ||
          '',
        projectName:
          invoice.project_name ||
          invoice.business_unit ||
          invoice.sales_order_no ||
          invoice.salesOrderNo ||
          '',
        packageName:
          invoice.package_name ||
          invoice.material_description ||
          invoice.materialDescriptionType ||
          '',
      })
    } else {
      updateEntry(index, { invoiceId })
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    if (!token) return

    const validEntries = entries.filter(
      (entry) => entry.paymentReceiptDate && entry.invoiceId && entry.paymentAmount
    )

    if (validEntries.length === 0) {
      toast.error('Please fill at least one complete payment entry.')
      return
    }

    setSaving(true)
    try {
      for (const entry of validEntries) {
        const payload = {
          paymentReceiptDate: entry.paymentReceiptDate,
          invoiceId: entry.invoiceId,
          customerName: entry.customerName,
          projectName: entry.projectName,
          packageName: entry.packageName,
          paymentAmount: Number(entry.paymentAmount),
          paymentType: entry.paymentType,
          bankName: entry.bankName,
          bankCreditDate: entry.bankCreditDate,
        }

        // Create each payment separately so one customer's multiple invoices can be saved together
        // If one fails, stop and show error
        // eslint-disable-next-line no-await-in-loop
        await paymentApi.create(payload)
      }

      toast.success(
        validEntries.length === 1
          ? 'Payment created successfully!'
          : `${validEntries.length} payments created successfully!`
      )
      navigate('/payments')
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create payment'
      toast.error(errorMsg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col gap-4">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Create Payment Entry
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Fill in the details below to record a new payment.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {entries.map((entry, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-dashed border-gray-200 rounded-2xl p-4 relative"
              >
                <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-gray-500">
                  Payment #{index + 1}
                </div>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(index)}
                    className="absolute -top-3 right-4 bg-white px-2 text-xs text-red-600 hover:text-red-800"
                    disabled={saving}
                  >
                    Remove
                  </button>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Payment Receipt Date *
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={entry.paymentReceiptDate}
                    onChange={(e) =>
                      updateEntry(index, {
                        paymentReceiptDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Invoice Number *
                  </label>
                  <select
                    className="input"
                    value={entry.invoiceId}
                    onChange={(e) => onInvoiceSelect(index, e.target.value)}
                    required
                    disabled={invoicesLoading}
                  >
                    <option value="">
                      {invoicesLoading
                        ? 'Loading invoices...'
                        : 'Select Invoice'}
                    </option>
                    {invoices.map((inv) => {
                      const id = getInvoiceIdentifier(inv)
                      if (!id) return null
                      return (
                        <option key={id} value={id}>
                          {getInvoiceLabel(inv)} - {getInvoiceCustomer(inv)}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Customer Name
                  </label>
                  <SmartDropdown
                    value={entry.customerName}
                    onChange={(val) =>
                      updateEntry(index, { customerName: val })
                    }
                    fieldName="customerName"
                    placeholder="Auto-filled from invoice"
                    inputClassName="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Project Name
                  </label>
                  <SmartDropdown
                    value={entry.projectName}
                    onChange={(val) =>
                      updateEntry(index, { projectName: val })
                    }
                    fieldName="projectName"
                    placeholder="Auto-filled from invoice"
                    inputClassName="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Package Name
                  </label>
                  <input
                    className="input"
                    value={entry.packageName}
                    onChange={(e) =>
                      updateEntry(index, { packageName: e.target.value })
                    }
                    placeholder="Auto-filled from invoice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Payment Amount *
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={entry.paymentAmount}
                    onChange={(e) =>
                      updateEntry(index, { paymentAmount: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Payment Type
                  </label>
                  <select
                    className="input"
                    value={entry.paymentType}
                    onChange={(e) =>
                      updateEntry(index, { paymentType: e.target.value })
                    }
                  >
                    <option value="1st Due">1st Due</option>
                    <option value="2nd Due">2nd Due</option>
                    <option value="3rd Due">3rd Due</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Bank Name
                  </label>
                  <input
                    className="input"
                    value={entry.bankName}
                    onChange={(e) =>
                      updateEntry(index, { bankName: e.target.value })
                    }
                    placeholder="Amount Credit Bank Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Bank Credit Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={entry.bankCreditDate}
                    onChange={(e) =>
                      updateEntry(index, { bankCreditDate: e.target.value })
                    }
                    placeholder="Payment Credit in Bank Date"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={addEntry}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                disabled={saving}
              >
                + Add another payment for this customer
              </button>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/payments')}
                  className="btn btn-outline btn-md"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Payment(s)'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

function defaultForm() {
  return {
    paymentReceiptDate: '',
    invoiceId: '',
    customerName: '',
    projectName: '',
    packageName: '',
    paymentAmount: 0,
    paymentType: '1st Due',
    bankName: '',
    bankCreditDate: '',
  }
}

// Helpers to work with both legacy sales invoices and new simple invoices
function getInvoiceIdentifier(inv) {
  if (!inv) return ''
  return (
    inv.gst_tax_invoice_no ||
    inv.internal_invoice_no ||
    inv.invoiceNumber ||
    inv.invoice_number ||
    (inv.id != null ? String(inv.id) : '')
  )
}

function getInvoiceLabel(inv) {
  return (
    inv.gst_tax_invoice_no ||
    inv.internal_invoice_no ||
    inv.invoiceNumber ||
    inv.invoice_number ||
    (inv.id != null ? `INV-${inv.id}` : 'Invoice')
  )
}

function getInvoiceCustomer(inv) {
  return (
    inv.customer_name ||
    inv.customerName ||
    (inv.customer && inv.customer.companyName) ||
    ''
  )
}

function mergeInvoicesByNumber(...lists) {
  const seen = new Set()
  const result = []

  lists.forEach((list) => {
    ;(list || []).forEach((inv) => {
      const key = getInvoiceIdentifier(inv)
      if (!key || seen.has(key)) return
      seen.add(key)
      result.push(inv)
    })
  })

  return result
}

