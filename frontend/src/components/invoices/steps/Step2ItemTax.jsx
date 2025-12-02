export default function Step2ItemTax({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">Item, Value & Tax Details</h3>
        <p className="text-sm text-secondary-600 mt-1">Enter item details, quantities, rates, and tax information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Material Description Type <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.materialDescriptionType ? 'border-danger-500' : ''}`}
            value={formData.materialDescriptionType || ''}
            onChange={(e) => updateFormData('materialDescriptionType', e.target.value)}
            placeholder="Enter Material Description Type"
            required
          />
          {errors.materialDescriptionType && <p className="text-xs text-danger-500 mt-1">{errors.materialDescriptionType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            State of Supply
          </label>
          <input
            type="text"
            className={`input ${errors.stateOfSupply ? 'border-danger-500' : ''}`}
            value={formData.stateOfSupply || ''}
            onChange={(e) => updateFormData('stateOfSupply', e.target.value)}
            placeholder="Enter State of Supply"
          />
          {errors.stateOfSupply && <p className="text-xs text-danger-500 mt-1">{errors.stateOfSupply}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Qty
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.qty ? 'border-danger-500' : ''}`}
            value={formData.qty || ''}
            onChange={(e) => updateFormData('qty', e.target.value)}
            placeholder="0.00"
          />
          {errors.qty && <p className="text-xs text-danger-500 mt-1">{errors.qty}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Unit
          </label>
          <select
            className={`input ${errors.unit ? 'border-danger-500' : ''}`}
            value={formData.unit || ''}
            onChange={(e) => updateFormData('unit', e.target.value)}
          >
            <option value="">Select Unit</option>
            <option value="NOS">NOS</option>
            <option value="KG">KG</option>
            <option value="MT">MT</option>
            <option value="LTR">LTR</option>
            <option value="MTR">MTR</option>
            <option value="SQM">SQM</option>
          </select>
          {errors.unit && <p className="text-xs text-danger-500 mt-1">{errors.unit}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Currency
          </label>
          <select
            className={`input ${errors.currency ? 'border-danger-500' : ''}`}
            value={formData.currency || 'INR'}
            onChange={(e) => updateFormData('currency', e.target.value)}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          {errors.currency && <p className="text-xs text-danger-500 mt-1">{errors.currency}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Basic Rate
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.basicRate ? 'border-danger-500' : ''}`}
            value={formData.basicRate || ''}
            onChange={(e) => updateFormData('basicRate', e.target.value)}
            placeholder="0.00"
          />
          {errors.basicRate && <p className="text-xs text-danger-500 mt-1">{errors.basicRate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Basic Value
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.basicValue ? 'border-danger-500' : ''}`}
            value={formData.basicValue || ''}
            onChange={(e) => updateFormData('basicValue', e.target.value)}
            placeholder="0.00"
          />
          {errors.basicValue && <p className="text-xs text-danger-500 mt-1">{errors.basicValue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Freight Invoice No
          </label>
          <input
            type="text"
            className={`input ${errors.freightInvoiceNo ? 'border-danger-500' : ''}`}
            value={formData.freightInvoiceNo || ''}
            onChange={(e) => updateFormData('freightInvoiceNo', e.target.value)}
            placeholder="Enter Freight Invoice No"
          />
          {errors.freightInvoiceNo && <p className="text-xs text-danger-500 mt-1">{errors.freightInvoiceNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Freight Rate
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.freightRate ? 'border-danger-500' : ''}`}
            value={formData.freightRate || ''}
            onChange={(e) => updateFormData('freightRate', e.target.value)}
            placeholder="0.00"
          />
          {errors.freightRate && <p className="text-xs text-danger-500 mt-1">{errors.freightRate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Freight Value
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.freightValue ? 'border-danger-500' : ''}`}
            value={formData.freightValue || ''}
            onChange={(e) => updateFormData('freightValue', e.target.value)}
            placeholder="0.00"
          />
          {errors.freightValue && <p className="text-xs text-danger-500 mt-1">{errors.freightValue}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            SGST Output
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.sgstOutput ? 'border-danger-500' : ''}`}
            value={formData.sgstOutput || ''}
            onChange={(e) => updateFormData('sgstOutput', e.target.value)}
            placeholder="0.00"
          />
          {errors.sgstOutput && <p className="text-xs text-danger-500 mt-1">{errors.sgstOutput}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            CGST Output
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.cgstOutput ? 'border-danger-500' : ''}`}
            value={formData.cgstOutput || ''}
            onChange={(e) => updateFormData('cgstOutput', e.target.value)}
            placeholder="0.00"
          />
          {errors.cgstOutput && <p className="text-xs text-danger-500 mt-1">{errors.cgstOutput}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            IGST Output
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.igstOutput ? 'border-danger-500' : ''}`}
            value={formData.igstOutput || ''}
            onChange={(e) => updateFormData('igstOutput', e.target.value)}
            placeholder="0.00"
          />
          {errors.igstOutput && <p className="text-xs text-danger-500 mt-1">{errors.igstOutput}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            UGST Output
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.ugstOutput ? 'border-danger-500' : ''}`}
            value={formData.ugstOutput || ''}
            onChange={(e) => updateFormData('ugstOutput', e.target.value)}
            placeholder="0.00"
          />
          {errors.ugstOutput && <p className="text-xs text-danger-500 mt-1">{errors.ugstOutput}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Total GST
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.totalGst ? 'border-danger-500' : ''}`}
            value={formData.totalGst || ''}
            onChange={(e) => updateFormData('totalGst', e.target.value)}
            placeholder="0.00"
          />
          {errors.totalGst && <p className="text-xs text-danger-500 mt-1">{errors.totalGst}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            TCS
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.tcs ? 'border-danger-500' : ''}`}
            value={formData.tcs || ''}
            onChange={(e) => updateFormData('tcs', e.target.value)}
            placeholder="0.00"
          />
          {errors.tcs && <p className="text-xs text-danger-500 mt-1">{errors.tcs}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            SubTotal
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.subTotal ? 'border-danger-500' : ''}`}
            value={formData.subTotal || ''}
            onChange={(e) => updateFormData('subTotal', e.target.value)}
            placeholder="0.00"
          />
          {errors.subTotal && <p className="text-xs text-danger-500 mt-1">{errors.subTotal}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Total Invoice Value
          </label>
          <input
            type="number"
            step="0.01"
            className={`input ${errors.totalInvoiceValue ? 'border-danger-500' : ''}`}
            value={formData.totalInvoiceValue || ''}
            onChange={(e) => updateFormData('totalInvoiceValue', e.target.value)}
            placeholder="0.00"
          />
          {errors.totalInvoiceValue && <p className="text-xs text-danger-500 mt-1">{errors.totalInvoiceValue}</p>}
        </div>
      </div>
    </div>
  )
}

