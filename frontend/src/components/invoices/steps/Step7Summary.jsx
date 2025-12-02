export default function Step7Summary({ formData, onEdit }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '₹0.00'
    return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">Review & Submit</h3>
        <p className="text-sm text-secondary-600 mt-1">Review all information before submitting</p>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        {/* Step 1 Summary */}
        <div className="border border-secondary-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-secondary-900 mb-3">Step 1: Invoice Header & Customer Info</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-secondary-600">Key ID:</span>
              <span className="ml-2 font-medium">{formData.keyId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-secondary-600">GST Tax Invoice No:</span>
              <span className="ml-2 font-medium">{formData.gstTaxInvoiceNo || 'N/A'}</span>
            </div>
            <div>
              <span className="text-secondary-600">GST Tax Invoice Date:</span>
              <span className="ml-2 font-medium">{formatDate(formData.gstTaxInvoiceDate)}</span>
            </div>
            <div>
              <span className="text-secondary-600">Customer Name:</span>
              <span className="ml-2 font-medium">{formData.customerName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-secondary-600">Invoice Type:</span>
              <span className="ml-2 font-medium">{formData.invoiceType || 'N/A'}</span>
            </div>
            <div>
              <span className="text-secondary-600">Business Unit:</span>
              <span className="ml-2 font-medium">{formData.businessUnit || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Step 2 Summary */}
        <div className="border border-secondary-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-secondary-900 mb-3">Step 2: Item, Value & Tax Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-secondary-600">Qty:</span>
              <span className="ml-2 font-medium">{formData.qty || '0'}</span>
            </div>
            <div>
              <span className="text-secondary-600">Unit:</span>
              <span className="ml-2 font-medium">{formData.unit || 'N/A'}</span>
            </div>
            <div>
              <span className="text-secondary-600">Basic Value:</span>
              <span className="ml-2 font-medium">{formatCurrency(formData.basicValue)}</span>
            </div>
            <div>
              <span className="text-secondary-600">Total GST:</span>
              <span className="ml-2 font-medium">{formatCurrency(formData.totalGst)}</span>
            </div>
            <div>
              <span className="text-secondary-600">SubTotal:</span>
              <span className="ml-2 font-medium">{formatCurrency(formData.subTotal)}</span>
            </div>
            <div>
              <span className="text-secondary-600">Total Invoice Value:</span>
              <span className="ml-2 font-medium">{formatCurrency(formData.totalInvoiceValue)}</span>
            </div>
          </div>
        </div>

        {/* Step 4-6 Payment Summary */}
        <div className="border border-secondary-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-secondary-900 mb-3">Payment Summary</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-secondary-600">Payment Terms:</span>
                <span className="ml-2 font-medium">{formData.paymentTerms || 'N/A'}</span>
              </div>
              <div>
                <span className="text-secondary-600">1st Due Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(formData.firstDueAmount)}</span>
              </div>
              <div>
                <span className="text-secondary-600">2nd Due Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(formData.secondDueAmount)}</span>
              </div>
              <div>
                <span className="text-secondary-600">3rd Due Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(formData.thirdDueAmount)}</span>
              </div>
              <div>
                <span className="text-secondary-600">Total Balance:</span>
                <span className="ml-2 font-medium text-primary-600">{formatCurrency(formData.totalBalance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Financial Summary */}
        <div className="border-2 border-primary-200 rounded-lg p-4 bg-primary-50">
          <h4 className="text-sm font-semibold text-secondary-900 mb-3">Financial Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-700">Total Invoice Value:</span>
              <span className="font-semibold text-lg">{formatCurrency(formData.totalInvoiceValue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-700">Total Balance:</span>
              <span className="font-semibold text-lg text-primary-600">{formatCurrency(formData.totalBalance)}</span>
            </div>
            {formData.overDueTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-secondary-700">Over Due Total:</span>
                <span className="font-semibold text-lg text-danger-600">{formatCurrency(formData.overDueTotal)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
        <p className="text-sm text-secondary-600">
          <strong>Note:</strong> Please review all the information above carefully. Once submitted, you can edit this invoice later if needed.
        </p>
      </div>
    </div>
  )
}

