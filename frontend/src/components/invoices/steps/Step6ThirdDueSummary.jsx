export default function Step6ThirdDueSummary({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">3rd Due, Summary & Deductions</h3>
        <p className="text-sm text-secondary-600 mt-1">Enter third due details, totals, and deduction information</p>
      </div>

      <div className="space-y-6">
        {/* 3rd Due Section */}
        <div>
          <h4 className="text-sm font-semibold text-secondary-900 mb-4">3rd Due Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                3rd Due Date
              </label>
              <input
                type="date"
                className={`input ${errors.thirdDueDate ? 'border-danger-500' : ''}`}
                value={formData.thirdDueDate || ''}
                onChange={(e) => updateFormData('thirdDueDate', e.target.value)}
              />
              {errors.thirdDueDate && <p className="text-xs text-danger-500 mt-1">{errors.thirdDueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                3rd Due Amount
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.thirdDueAmount ? 'border-danger-500' : ''}`}
                value={formData.thirdDueAmount || ''}
                onChange={(e) => updateFormData('thirdDueAmount', e.target.value)}
                placeholder="0.00"
              />
              {errors.thirdDueAmount && <p className="text-xs text-danger-500 mt-1">{errors.thirdDueAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Payment Received Amount (3rd Due)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.paymentReceivedAmountThirdDue ? 'border-danger-500' : ''}`}
                value={formData.paymentReceivedAmountThirdDue || ''}
                onChange={(e) => updateFormData('paymentReceivedAmountThirdDue', e.target.value)}
                placeholder="0.00"
              />
              {errors.paymentReceivedAmountThirdDue && <p className="text-xs text-danger-500 mt-1">{errors.paymentReceivedAmountThirdDue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Receipt Date (3rd Due)
              </label>
              <input
                type="date"
                className={`input ${errors.receiptDateThirdDue ? 'border-danger-500' : ''}`}
                value={formData.receiptDateThirdDue || ''}
                onChange={(e) => updateFormData('receiptDateThirdDue', e.target.value)}
              />
              {errors.receiptDateThirdDue && <p className="text-xs text-danger-500 mt-1">{errors.receiptDateThirdDue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                3rd Due Balance
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.thirdDueBalance ? 'border-danger-500' : ''}`}
                value={formData.thirdDueBalance || ''}
                onChange={(e) => updateFormData('thirdDueBalance', e.target.value)}
                placeholder="0.00"
              />
              {errors.thirdDueBalance && <p className="text-xs text-danger-500 mt-1">{errors.thirdDueBalance}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Not Due (3rd Due)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.notDueThirdDue ? 'border-danger-500' : ''}`}
                value={formData.notDueThirdDue || ''}
                onChange={(e) => updateFormData('notDueThirdDue', e.target.value)}
                placeholder="0.00"
              />
              {errors.notDueThirdDue && <p className="text-xs text-danger-500 mt-1">{errors.notDueThirdDue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Over Due (3rd Due)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.overDueThirdDue ? 'border-danger-500' : ''}`}
                value={formData.overDueThirdDue || ''}
                onChange={(e) => updateFormData('overDueThirdDue', e.target.value)}
                placeholder="0.00"
              />
              {errors.overDueThirdDue && <p className="text-xs text-danger-500 mt-1">{errors.overDueThirdDue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                No of Days of Payment Receipt (3rd Due)
              </label>
              <input
                type="number"
                className={`input ${errors.noOfDaysOfPaymentReceiptThirdDue ? 'border-danger-500' : ''}`}
                value={formData.noOfDaysOfPaymentReceiptThirdDue || ''}
                onChange={(e) => updateFormData('noOfDaysOfPaymentReceiptThirdDue', e.target.value)}
                placeholder="0"
              />
              {errors.noOfDaysOfPaymentReceiptThirdDue && <p className="text-xs text-danger-500 mt-1">{errors.noOfDaysOfPaymentReceiptThirdDue}</p>}
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="border-t border-secondary-200 pt-4">
          <h4 className="text-sm font-semibold text-secondary-900 mb-4">Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Total Balance
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.totalBalance ? 'border-danger-500' : ''}`}
                value={formData.totalBalance || ''}
                onChange={(e) => updateFormData('totalBalance', e.target.value)}
                placeholder="0.00"
              />
              {errors.totalBalance && <p className="text-xs text-danger-500 mt-1">{errors.totalBalance}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Not Due Total
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.notDueTotal ? 'border-danger-500' : ''}`}
                value={formData.notDueTotal || ''}
                onChange={(e) => updateFormData('notDueTotal', e.target.value)}
                placeholder="0.00"
              />
              {errors.notDueTotal && <p className="text-xs text-danger-500 mt-1">{errors.notDueTotal}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Over Due Total
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.overDueTotal ? 'border-danger-500' : ''}`}
                value={formData.overDueTotal || ''}
                onChange={(e) => updateFormData('overDueTotal', e.target.value)}
                placeholder="0.00"
              />
              {errors.overDueTotal && <p className="text-xs text-danger-500 mt-1">{errors.overDueTotal}</p>}
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="border-t border-secondary-200 pt-4">
          <h4 className="text-sm font-semibold text-secondary-900 mb-4">Deductions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                IT TDS @2% (on Service Part)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.itTds2PercentService ? 'border-danger-500' : ''}`}
                value={formData.itTds2PercentService || ''}
                onChange={(e) => updateFormData('itTds2PercentService', e.target.value)}
                placeholder="0.00"
              />
              {errors.itTds2PercentService && <p className="text-xs text-danger-500 mt-1">{errors.itTds2PercentService}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                IT TDS @1% (u/s 194Q Supply)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.itTds1PercentUs194Q ? 'border-danger-500' : ''}`}
                value={formData.itTds1PercentUs194Q || ''}
                onChange={(e) => updateFormData('itTds1PercentUs194Q', e.target.value)}
                placeholder="0.00"
              />
              {errors.itTds1PercentUs194Q && <p className="text-xs text-danger-500 mt-1">{errors.itTds1PercentUs194Q}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                LCess / BOQ @1% (Works)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.lcessBoq1PercentWorks ? 'border-danger-500' : ''}`}
                value={formData.lcessBoq1PercentWorks || ''}
                onChange={(e) => updateFormData('lcessBoq1PercentWorks', e.target.value)}
                placeholder="0.00"
              />
              {errors.lcessBoq1PercentWorks && <p className="text-xs text-danger-500 mt-1">{errors.lcessBoq1PercentWorks}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                TDS @2% (CGST@1% SGST@1%)
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.tds2PercentCgst1PercentSgst1Percent ? 'border-danger-500' : ''}`}
                value={formData.tds2PercentCgst1PercentSgst1Percent || ''}
                onChange={(e) => updateFormData('tds2PercentCgst1PercentSgst1Percent', e.target.value)}
                placeholder="0.00"
              />
              {errors.tds2PercentCgst1PercentSgst1Percent && <p className="text-xs text-danger-500 mt-1">{errors.tds2PercentCgst1PercentSgst1Percent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                TDS on CGST @1%
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.tdsOnCgst1Percent ? 'border-danger-500' : ''}`}
                value={formData.tdsOnCgst1Percent || ''}
                onChange={(e) => updateFormData('tdsOnCgst1Percent', e.target.value)}
                placeholder="0.00"
              />
              {errors.tdsOnCgst1Percent && <p className="text-xs text-danger-500 mt-1">{errors.tdsOnCgst1Percent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                TDS on SGST @1%
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.tdsOnSgst1Percent ? 'border-danger-500' : ''}`}
                value={formData.tdsOnSgst1Percent || ''}
                onChange={(e) => updateFormData('tdsOnSgst1Percent', e.target.value)}
                placeholder="0.00"
              />
              {errors.tdsOnSgst1Percent && <p className="text-xs text-danger-500 mt-1">{errors.tdsOnSgst1Percent}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Excess Supply Qty
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.excessSupplyQty ? 'border-danger-500' : ''}`}
                value={formData.excessSupplyQty || ''}
                onChange={(e) => updateFormData('excessSupplyQty', e.target.value)}
                placeholder="0.00"
              />
              {errors.excessSupplyQty && <p className="text-xs text-danger-500 mt-1">{errors.excessSupplyQty}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Interest on Advance
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.interestOnAdvance ? 'border-danger-500' : ''}`}
                value={formData.interestOnAdvance || ''}
                onChange={(e) => updateFormData('interestOnAdvance', e.target.value)}
                placeholder="0.00"
              />
              {errors.interestOnAdvance && <p className="text-xs text-danger-500 mt-1">{errors.interestOnAdvance}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Any Hold
              </label>
              <input
                type="text"
                className={`input ${errors.anyHold ? 'border-danger-500' : ''}`}
                value={formData.anyHold || ''}
                onChange={(e) => updateFormData('anyHold', e.target.value)}
                placeholder="Enter hold details"
              />
              {errors.anyHold && <p className="text-xs text-danger-500 mt-1">{errors.anyHold}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Penalty / LD Deduction
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.penaltyLdDeduction ? 'border-danger-500' : ''}`}
                value={formData.penaltyLdDeduction || ''}
                onChange={(e) => updateFormData('penaltyLdDeduction', e.target.value)}
                placeholder="0.00"
              />
              {errors.penaltyLdDeduction && <p className="text-xs text-danger-500 mt-1">{errors.penaltyLdDeduction}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Bank Charges
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.bankCharges ? 'border-danger-500' : ''}`}
                value={formData.bankCharges || ''}
                onChange={(e) => updateFormData('bankCharges', e.target.value)}
                placeholder="0.00"
              />
              {errors.bankCharges && <p className="text-xs text-danger-500 mt-1">{errors.bankCharges}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                LC Discrepancy Charge
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.lcDiscrepancyCharge ? 'border-danger-500' : ''}`}
                value={formData.lcDiscrepancyCharge || ''}
                onChange={(e) => updateFormData('lcDiscrepancyCharge', e.target.value)}
                placeholder="0.00"
              />
              {errors.lcDiscrepancyCharge && <p className="text-xs text-danger-500 mt-1">{errors.lcDiscrepancyCharge}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Provision for Bad Debts
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.provisionForBadDebts ? 'border-danger-500' : ''}`}
                value={formData.provisionForBadDebts || ''}
                onChange={(e) => updateFormData('provisionForBadDebts', e.target.value)}
                placeholder="0.00"
              />
              {errors.provisionForBadDebts && <p className="text-xs text-danger-500 mt-1">{errors.provisionForBadDebts}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Bad Debts
              </label>
              <input
                type="number"
                step="0.01"
                className={`input ${errors.badDebts ? 'border-danger-500' : ''}`}
                value={formData.badDebts || ''}
                onChange={(e) => updateFormData('badDebts', e.target.value)}
                placeholder="0.00"
              />
              {errors.badDebts && <p className="text-xs text-danger-500 mt-1">{errors.badDebts}</p>}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="border-t border-secondary-200 pt-4">
          <h4 className="text-sm font-semibold text-secondary-900 mb-4">Additional Notes</h4>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Notes
            </label>
            <textarea
              className={`input min-h-[100px] ${errors.notes ? 'border-danger-500' : ''}`}
              value={formData.notes || ''}
              onChange={(e) => updateFormData('notes', e.target.value)}
              placeholder="Additional notes or comments..."
            />
            {errors.notes && <p className="text-xs text-danger-500 mt-1">{errors.notes}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

