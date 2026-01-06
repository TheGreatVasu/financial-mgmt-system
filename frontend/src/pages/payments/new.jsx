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

  // Tax calculation function
  function calculateTotals(entry) {
    const baseAmount = Number(entry.paymentAmount) || 0
    const progressiveDelivery = Number(entry.progressiveDelivery) || 0
    const agtCommissioning = Number(entry.agtCommissioning) || 0
    const gstTds = Number(entry.gstTds) || 0
    const itTds = Number(entry.itTds) || 0
    const itTdsU194Q = Number(entry.itTdsU194Q) || 0
    const labourCess = Number(entry.labourCess) || 0
    const oldItTds = Number(entry.oldItTds) || 0
    const otherRecovery = Number(entry.otherRecovery) || 0
    const penalty = Number(entry.penalty) || 0
    
    // Calculate totals
    const totalDeductions = gstTds + itTds + itTdsU194Q + labourCess + oldItTds + otherRecovery + penalty
    const netReceivable = baseAmount - totalDeductions
    
    return {
      progressiveDelivery,
      agtCommissioning,
      gstTds,
      itTds,
      itTdsU194Q,
      labourCess,
      oldItTds,
      otherRecovery,
      penalty,
      totalDeductions,
      netReceivable
    }
  }

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

  function addInvoiceForCustomer(index) {
    // Add another invoice entry for the same customer
    const currentEntry = entries[index]
    const newEntry = {
      ...defaultForm(),
      paymentReceiptDate: currentEntry.paymentReceiptDate,
      customerName: currentEntry.customerName,
      projectName: currentEntry.projectName,
      packageName: currentEntry.packageName,
      bankName: currentEntry.bankName,
      bankCreditDate: currentEntry.bankCreditDate,
      paymentType: currentEntry.paymentType,
      // invoiceId, paymentAmount, and taxes are left blank for new invoice selection
    }
    setEntries((prev) => [...prev, newEntry])
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
        // Validate and prepare payload with proper type conversions
        const paymentAmount = Number(entry.paymentAmount);
        if (!paymentAmount || paymentAmount <= 0) {
          throw new Error('Payment amount must be greater than 0');
        }

        const payload = {
          // Required fields
          paymentReceiptDate: entry.paymentReceiptDate,
          invoiceId: String(entry.invoiceId).trim(), // Send as string, backend will handle lookup
          paymentAmount: paymentAmount,

          // Optional customer/project/package details
          customerName: entry.customerName || '',
          projectName: entry.projectName || '',
          packageName: entry.packageName || '',

          // Payment details
          paymentType: entry.paymentType || '',
          bankName: entry.bankName || '',
          bankCreditDate: entry.bankCreditDate || '',

          // Tax deductions - always as numbers, default to 0
          progressiveDelivery: Number(entry.progressiveDelivery || 0),
          agtCommissioning: Number(entry.agtCommissioning || 0),
          gstTds: Number(entry.gstTds || 0),
          itTds: Number(entry.itTds || 0),
          itTdsU194Q: Number(entry.itTdsU194Q || 0),
          labourCess: Number(entry.labourCess || 0),
          oldItTds: Number(entry.oldItTds || 0),
          otherRecovery: Number(entry.otherRecovery || 0),
          penalty: Number(entry.penalty || 0),
        };

        // Log payload for debugging
        console.log('Payment payload being sent:', payload);

        // Create each payment separately so one customer's multiple invoices can be saved together
        // If one fails, stop and show error
        // eslint-disable-next-line no-await-in-loop
        const response = await paymentApi.create(payload);
        console.log('Payment created successfully:', response);
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
      console.error('Payment creation failed:', err);
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
            {entries.map((entry, index) => {
              const taxes = calculateTotals(entry)
              return (
                <div key={index} className="border border-dashed border-gray-300 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white relative">
                  <div className="absolute -top-3 left-4 bg-white px-3 py-1 text-xs font-bold text-blue-600 border border-blue-200 rounded-full">
                    Payment #{index + 1}
                  </div>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="absolute -top-3 right-4 bg-white px-3 py-1 text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 rounded-full"
                      disabled={saving}
                    >
                      ✕ Remove
                    </button>
                  )}

                  {/* SECTION 1: Fixed Fields */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
                      Payment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Receipt Date *
                        </label>
                        <input
                          type="date"
                          className="input w-full"
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Customer Name *
                        </label>
                        <SmartDropdown
                          value={entry.customerName}
                          onChange={(val) =>
                            updateEntry(index, { customerName: val })
                          }
                          fieldName="customerName"
                          placeholder="Select or type..."
                          inputClassName="input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Project Name
                        </label>
                        <SmartDropdown
                          value={entry.projectName}
                          onChange={(val) =>
                            updateEntry(index, { projectName: val })
                          }
                          fieldName="projectName"
                          placeholder="Select or type..."
                          inputClassName="input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Package Name
                        </label>
                        <input
                          className="input w-full"
                          value={entry.packageName}
                          onChange={(e) =>
                            updateEntry(index, { packageName: e.target.value })
                          }
                          placeholder="Package details"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Amount *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                          <input
                            type="number"
                            className="input w-full pl-8"
                            value={entry.paymentAmount}
                            onChange={(e) =>
                              updateEntry(index, { paymentAmount: e.target.value })
                            }
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          className="input w-full"
                          value={entry.bankName}
                          onChange={(e) =>
                            updateEntry(index, { bankName: e.target.value })
                          }
                          placeholder="Amount Credit Bank Name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Bank Credit Date
                        </label>
                        <input
                          type="date"
                          className="input w-full"
                          value={entry.bankCreditDate}
                          onChange={(e) =>
                            updateEntry(index, { bankCreditDate: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Type
                        </label>
                        <select
                          className="input w-full"
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
                    </div>
                  </div>

                  {/* SECTION 2: Invoice Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500">
                      Invoice Information
                    </h3>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Invoice Number * 
                          {entry.invoiceId && (
                            <span className="text-xs text-green-600 font-normal ml-2">✓ Selected</span>
                          )}
                        </label>
                        <select
                          className="input w-full"
                          value={entry.invoiceId}
                          onChange={(e) => onInvoiceSelect(index, e.target.value)}
                          required
                          disabled={invoicesLoading}
                        >
                          <option value="">
                            {invoicesLoading ? 'Loading invoices...' : 'Select Invoice'}
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
                      <button
                        type="button"
                        onClick={() => addInvoiceForCustomer(index)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        + Add Invoice
                      </button>
                    </div>
                  </div>

                  {/* SECTION 3: Tax Deductions & Breakdown - Show after Invoice is selected */}
                  {entry.invoiceId && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-500">
                        Tax Deductions & Breakdown
                      </h3>
                      
                      {entry.paymentAmount && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 mb-6 border border-purple-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Base Amount</p>
                              <p className="text-2xl font-bold text-purple-900">₹{(Number(entry.paymentAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-red-600 font-semibold uppercase mb-1">Total Deductions</p>
                              <p className="text-2xl font-bold text-red-900">₹{taxes.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-600 font-semibold uppercase mb-1">Net Receivable</p>
                              <p className="text-2xl font-bold text-green-900">₹{taxes.netReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Payment Received</p>
                              <p className="text-2xl font-bold text-blue-900">₹{(Number(entry.paymentAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">90% Progressively after Delivery</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.progressiveDelivery || ''}
                              onChange={(e) =>
                                updateEntry(index, { progressiveDelivery: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">10% Agt Commissioning</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.agtCommissioning || ''}
                              onChange={(e) =>
                                updateEntry(index, { agtCommissioning: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">GST TDS @ 2%</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.gstTds || ''}
                              onChange={(e) =>
                                updateEntry(index, { gstTds: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">IT TDS @ 2%</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.itTds || ''}
                              onChange={(e) =>
                                updateEntry(index, { itTds: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">IT TDS u/s 194Q</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.itTdsU194Q || ''}
                              onChange={(e) =>
                                updateEntry(index, { itTdsU194Q: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Labour Cess 1%</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.labourCess || ''}
                              onChange={(e) =>
                                updateEntry(index, { labourCess: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Old IT TDS @ 2% Adjusted</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.oldItTds || ''}
                              onChange={(e) =>
                                updateEntry(index, { oldItTds: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Other Recovery</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.otherRecovery || ''}
                              onChange={(e) =>
                                updateEntry(index, { otherRecovery: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Penalty</label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-600 font-semibold">₹</span>
                            <input
                              type="number"
                              className="input w-full pl-8"
                              value={entry.penalty || ''}
                              onChange={(e) =>
                                updateEntry(index, { penalty: e.target.value })
                              }
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex justify-end gap-3 pt-4">
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
    progressiveDelivery: 0,
    agtCommissioning: 0,
    gstTds: 0,
    itTds: 0,
    itTdsU194Q: 0,
    labourCess: 0,
    oldItTds: 0,
    otherRecovery: 0,
    penalty: 0,
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

