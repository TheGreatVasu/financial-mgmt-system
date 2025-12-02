export default function Step5SecondDue({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">2nd Due Details</h3>
        <p className="text-sm text-secondary-600 mt-1">Enter second due payment information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            2nd Due Date
          </label>
          <input
            type="date"
            className={`input ${errors.secondDueDate ? 'border-danger-500' : ''}`}
            value={formData.secondDueDate || ''}
            onChange={(e) => updateFormData('secondDueDate', e.target.value)}
          />
          {errors.secondDueDate && <p className="text-xs text-danger-500 mt-1">{errors.secondDueDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            2nd Due Amount
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.secondDueAmount ? 'border-danger-500' : ''}`}
            value={formData.secondDueAmount || ''}
            onChange={(e) => updateFormData('secondDueAmount', e.target.value)}
            placeholder="0.00"
          />
          {errors.secondDueAmount && <p className="text-xs text-danger-500 mt-1">{errors.secondDueAmount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Payment Received Amount (2nd Due)
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.paymentReceivedAmountSecondDue ? 'border-danger-500' : ''}`}
            value={formData.paymentReceivedAmountSecondDue || ''}
            onChange={(e) => updateFormData('paymentReceivedAmountSecondDue', e.target.value)}
            placeholder="0.00"
          />
          {errors.paymentReceivedAmountSecondDue && <p className="text-xs text-danger-500 mt-1">{errors.paymentReceivedAmountSecondDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Receipt Date (2nd Due)
          </label>
          <input
            type="date"
            className={`input ${errors.receiptDateSecondDue ? 'border-danger-500' : ''}`}
            value={formData.receiptDateSecondDue || ''}
            onChange={(e) => updateFormData('receiptDateSecondDue', e.target.value)}
          />
          {errors.receiptDateSecondDue && <p className="text-xs text-danger-500 mt-1">{errors.receiptDateSecondDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            2nd Due Balance
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.secondDueBalance ? 'border-danger-500' : ''}`}
            value={formData.secondDueBalance || ''}
            onChange={(e) => updateFormData('secondDueBalance', e.target.value)}
            placeholder="0.00"
          />
          {errors.secondDueBalance && <p className="text-xs text-danger-500 mt-1">{errors.secondDueBalance}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Not Due (2nd Due)
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.notDueSecondDue ? 'border-danger-500' : ''}`}
            value={formData.notDueSecondDue || ''}
            onChange={(e) => updateFormData('notDueSecondDue', e.target.value)}
            placeholder="0.00"
          />
          {errors.notDueSecondDue && <p className="text-xs text-danger-500 mt-1">{errors.notDueSecondDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Over Due (2nd Due)
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.overDueSecondDue ? 'border-danger-500' : ''}`}
            value={formData.overDueSecondDue || ''}
            onChange={(e) => updateFormData('overDueSecondDue', e.target.value)}
            placeholder="0.00"
          />
          {errors.overDueSecondDue && <p className="text-xs text-danger-500 mt-1">{errors.overDueSecondDue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            No of Days of Payment Receipt (2nd Due)
          </label>
          <input
            type="number"
            className={`input ${errors.noOfDaysOfPaymentReceiptSecondDue ? 'border-danger-500' : ''}`}
            value={formData.noOfDaysOfPaymentReceiptSecondDue || ''}
            onChange={(e) => updateFormData('noOfDaysOfPaymentReceiptSecondDue', e.target.value)}
            placeholder="0"
          />
          {errors.noOfDaysOfPaymentReceiptSecondDue && <p className="text-xs text-danger-500 mt-1">{errors.noOfDaysOfPaymentReceiptSecondDue}</p>}
        </div>
      </div>
    </div>
  )
}

