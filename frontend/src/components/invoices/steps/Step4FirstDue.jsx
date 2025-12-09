const PAYMENT_TEXT_OPTIONS = [
  'Advance Payment',
  'Progress Billing',
  'Milestone Based',
  'Partial Payment',
  'Final Settlement'
]

const PAYMENT_TERM_OPTIONS = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'Immediate', 'Custom']

export default function Step4FirstDue({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">Payment Info & 1st Due</h3>
        <p className="text-sm text-secondary-600 mt-1">Enter payment terms and first due details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Payment Text
          </label>
          <select
            className={`input ${errors.paymentText ? 'border-danger-500' : ''}`}
            value={formData.paymentText || ''}
            onChange={(e) => updateFormData('paymentText', e.target.value)}
          >
            <option value="">Select Payment Text</option>
            {PAYMENT_TEXT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.paymentText && <p className="text-xs text-danger-500 mt-1">{errors.paymentText}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Payment Terms
          </label>
          <select
            className={`input ${errors.paymentTerms ? 'border-danger-500' : ''}`}
            value={formData.paymentTerms || 'Net 30'}
            onChange={(e) => updateFormData('paymentTerms', e.target.value)}
          >
            {PAYMENT_TERM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.paymentTerms && <p className="text-xs text-danger-500 mt-1">{errors.paymentTerms}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            1st Due Date
          </label>
          <input
            type="date"
            className={`input ${errors.firstDueDate ? 'border-danger-500' : ''}`}
            value={formData.firstDueDate || ''}
            onChange={(e) => updateFormData('firstDueDate', e.target.value)}
          />
          {errors.firstDueDate && <p className="text-xs text-danger-500 mt-1">{errors.firstDueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            1st Due Amount
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.firstDueAmount ? 'border-danger-500' : ''}`}
            value={formData.firstDueAmount || ''}
            onChange={(e) => updateFormData('firstDueAmount', e.target.value)}
            placeholder="0.00"
          />
          {errors.firstDueAmount && <p className="text-xs text-danger-500 mt-1">{errors.firstDueAmount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Payment Received Amount (1st Due)
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.paymentReceivedAmountFirstDue ? 'border-danger-500' : ''}`}
            value={formData.paymentReceivedAmountFirstDue || ''}
            onChange={(e) => updateFormData('paymentReceivedAmountFirstDue', e.target.value)}
            placeholder="0.00"
          />
          {errors.paymentReceivedAmountFirstDue && <p className="text-xs text-danger-500 mt-1">{errors.paymentReceivedAmountFirstDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Receipt Date (1st Due)
          </label>
          <input
            type="date"
            className={`input ${errors.receiptDateFirstDue ? 'border-danger-500' : ''}`}
            value={formData.receiptDateFirstDue || ''}
            onChange={(e) => updateFormData('receiptDateFirstDue', e.target.value)}
          />
          {errors.receiptDateFirstDue && <p className="text-xs text-danger-500 mt-1">{errors.receiptDateFirstDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            1st Due Balance
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.firstDueBalance ? 'border-danger-500' : ''}`}
            value={formData.firstDueBalance || ''}
            onChange={(e) => updateFormData('firstDueBalance', e.target.value)}
            placeholder="0.00"
          />
          {errors.firstDueBalance && <p className="text-xs text-danger-500 mt-1">{errors.firstDueBalance}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Not Due (1st Due)
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.notDueFirstDue ? 'border-danger-500' : ''}`}
            value={formData.notDueFirstDue || ''}
            onChange={(e) => updateFormData('notDueFirstDue', e.target.value)}
            placeholder="0.00"
          />
          {errors.notDueFirstDue && <p className="text-xs text-danger-500 mt-1">{errors.notDueFirstDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Over Due (1st Due)
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.overDueFirstDue ? 'border-danger-500' : ''}`}
            value={formData.overDueFirstDue || ''}
            onChange={(e) => updateFormData('overDueFirstDue', e.target.value)}
            placeholder="0.00"
          />
          {errors.overDueFirstDue && <p className="text-xs text-danger-500 mt-1">{errors.overDueFirstDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            No of Days of Payment Receipt (1st Due)
          </label>
          <input
            type="number"
            className={`input ${errors.noOfDaysOfPaymentReceiptFirstDue ? 'border-danger-500' : ''}`}
            value={formData.noOfDaysOfPaymentReceiptFirstDue || ''}
            onChange={(e) => updateFormData('noOfDaysOfPaymentReceiptFirstDue', e.target.value)}
            placeholder="0"
          />
          {errors.noOfDaysOfPaymentReceiptFirstDue && <p className="text-xs text-danger-500 mt-1">{errors.noOfDaysOfPaymentReceiptFirstDue}</p>}
        </div>
      </div>
    </div>
  )
}

