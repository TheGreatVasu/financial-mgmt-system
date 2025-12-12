const BUSINESS_UNIT_OPTIONS = [
  'Automation',
  'Energy',
  'Manufacturing',
  'Services',
  'Projects',
  'Other'
]

export default function Step1Header({ formData, updateFormData, errors, customers = [], poEntries = [], paymentTerms = [] }) {
  
  // Handle PO Entry selection - auto-fill customer and related fields
  const handlePOEntrySelect = (poEntryId) => {
    if (!poEntryId) return
    
    const selectedPO = poEntries.find(po => (po.id || po._id) == poEntryId)
    if (!selectedPO) return
    
    // Auto-fill customer from PO entry
    if (selectedPO.customerId || selectedPO.customer_id) {
      updateFormData('customerId', selectedPO.customerId || selectedPO.customer_id)
    }
    if (selectedPO.customerName || selectedPO.customer_name) {
      updateFormData('customerName', selectedPO.customerName || selectedPO.customer_name)
    }
    
    // Auto-fill PO details
    if (selectedPO.poNo || selectedPO.po_no) {
      updateFormData('poNoReference', selectedPO.poNo || selectedPO.po_no)
    }
    if (selectedPO.poDate || selectedPO.po_date) {
      updateFormData('poDate', selectedPO.poDate || selectedPO.po_date)
    }
    
    // Auto-fill segment, zone, business unit
    if (selectedPO.segment) {
      updateFormData('segment', selectedPO.segment)
    }
    if (selectedPO.zone) {
      updateFormData('zone', selectedPO.zone)
    }
    if (selectedPO.businessUnit || selectedPO.business_unit) {
      updateFormData('businessUnit', selectedPO.businessUnit || selectedPO.business_unit)
    }
    
    // Auto-fill payment terms
    if (selectedPO.paymentTerms || selectedPO.payment_terms) {
      updateFormData('paymentTerms', selectedPO.paymentTerms || selectedPO.payment_terms)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">Invoice Header & Customer Info</h3>
        <p className="text-sm text-secondary-600 mt-1">Enter basic invoice and customer information. Select a PO Entry to auto-fill related fields.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">Key ID</label>
          <div className="input pointer-events-none cursor-not-allowed bg-secondary-50 text-secondary-600">
            {formData.keyId || 'Assigned automatically on save'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            GST Tax Invoice No <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            className={`input ${errors.gstTaxInvoiceNo ? 'border-danger-500' : ''}`}
            value={formData.gstTaxInvoiceNo || ''}
            onChange={(e) => updateFormData('gstTaxInvoiceNo', e.target.value)}
            placeholder="Enter GST Tax Invoice No"
            required
          />
          {errors.gstTaxInvoiceNo && <p className="text-xs text-danger-500 mt-1">{errors.gstTaxInvoiceNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            GST Tax Invoice Date <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            className={`input ${errors.gstTaxInvoiceDate ? 'border-danger-500' : ''}`}
            value={formData.gstTaxInvoiceDate || ''}
            onChange={(e) => updateFormData('gstTaxInvoiceDate', e.target.value)}
            required
          />
          {errors.gstTaxInvoiceDate && <p className="text-xs text-danger-500 mt-1">{errors.gstTaxInvoiceDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Internal Invoice No
          </label>
          <input
            type="text"
            className={`input ${errors.internalInvoiceNo ? 'border-danger-500' : ''}`}
            value={formData.internalInvoiceNo || ''}
            onChange={(e) => updateFormData('internalInvoiceNo', e.target.value)}
            placeholder="Enter Internal Invoice No"
          />
          {errors.internalInvoiceNo && <p className="text-xs text-danger-500 mt-1">{errors.internalInvoiceNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice Type
          </label>
          <select
            className={`input ${errors.invoiceType ? 'border-danger-500' : ''}`}
            value={formData.invoiceType || ''}
            onChange={(e) => updateFormData('invoiceType', e.target.value)}
          >
            <option value="">Select Invoice Type</option>
            <option value="GST">GST</option>
            <option value="Non-GST">Non-GST</option>
            <option value="Proforma">Proforma</option>
          </select>
          {errors.invoiceType && <p className="text-xs text-danger-500 mt-1">{errors.invoiceType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Business Unit
          </label>
          <select
            className={`input ${errors.businessUnit ? 'border-danger-500' : ''}`}
            value={formData.businessUnit || ''}
            onChange={(e) => updateFormData('businessUnit', e.target.value)}
          >
            <option value="">Select Business Unit</option>
            {BUSINESS_UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          {errors.businessUnit && <p className="text-xs text-danger-500 mt-1">{errors.businessUnit}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Customer <span className="text-danger-500">*</span>
          </label>
          <select
            className={`input ${errors.customerId ? 'border-danger-500' : ''}`}
            value={formData.customerId || ''}
            onChange={(e) => {
              updateFormData('customerId', e.target.value)
              // Also set customerName from selected customer
              const selectedCustomer = customers.find(c => (c.id || c._id) == e.target.value)
              if (selectedCustomer) {
                updateFormData('customerName', selectedCustomer.companyName || selectedCustomer.company_name || selectedCustomer.name || '')
              }
            }}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id || customer._id} value={customer.id || customer._id}>
                {customer.companyName || customer.company_name || customer.name || 'Unknown'}
              </option>
            ))}
          </select>
          {errors.customerId && <p className="text-xs text-danger-500 mt-1">{errors.customerId}</p>}
        </div>
        
        {/* Customer name now derives from selection, so no duplicate input */}

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Segment
          </label>
          <input
            type="text"
            className={`input ${errors.segment ? 'border-danger-500' : ''}`}
            value={formData.segment || ''}
            onChange={(e) => updateFormData('segment', e.target.value)}
            placeholder="Enter Segment"
          />
          {errors.segment && <p className="text-xs text-danger-500 mt-1">{errors.segment}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Region
          </label>
          <input
            type="text"
            className={`input ${errors.region ? 'border-danger-500' : ''}`}
            value={formData.region || ''}
            onChange={(e) => updateFormData('region', e.target.value)}
            placeholder="Enter Region"
          />
          {errors.region && <p className="text-xs text-danger-500 mt-1">{errors.region}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Zone
          </label>
          <input
            type="text"
            className={`input ${errors.zone ? 'border-danger-500' : ''}`}
            value={formData.zone || ''}
            onChange={(e) => updateFormData('zone', e.target.value)}
            placeholder="Enter Zone"
          />
          {errors.zone && <p className="text-xs text-danger-500 mt-1">{errors.zone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Sales Order No
          </label>
          <input
            type="text"
            className={`input ${errors.salesOrderNo ? 'border-danger-500' : ''}`}
            value={formData.salesOrderNo || ''}
            onChange={(e) => updateFormData('salesOrderNo', e.target.value)}
            placeholder="Enter Sales Order No"
          />
          {errors.salesOrderNo && <p className="text-xs text-danger-500 mt-1">{errors.salesOrderNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Account Manager Name
          </label>
          <input
            type="text"
            className={`input ${errors.accountManagerName ? 'border-danger-500' : ''}`}
            value={formData.accountManagerName || ''}
            onChange={(e) => updateFormData('accountManagerName', e.target.value)}
            placeholder="Enter Account Manager Name"
          />
          {errors.accountManagerName && <p className="text-xs text-danger-500 mt-1">{errors.accountManagerName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            PO Entry (Select to auto-fill)
          </label>
          <select
            className={`input ${errors.poEntryId ? 'border-danger-500' : ''}`}
            value={formData.poEntryId || ''}
            onChange={(e) => {
              updateFormData('poEntryId', e.target.value)
              handlePOEntrySelect(e.target.value)
            }}
          >
            <option value="">Select PO Entry (Optional)</option>
            {poEntries.map((po) => (
              <option key={po.id || po._id} value={po.id || po._id}>
                {po.poNo || po.po_no || 'PO'} - {po.customerName || po.customer_name || 'Customer'} ({po.totalPOValue || po.total_po_value || 0})
              </option>
            ))}
          </select>
          {errors.poEntryId && <p className="text-xs text-danger-500 mt-1">{errors.poEntryId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            PO No / Reference
          </label>
          <input
            type="text"
            className={`input ${errors.poNoReference ? 'border-danger-500' : ''}`}
            value={formData.poNoReference || ''}
            onChange={(e) => updateFormData('poNoReference', e.target.value)}
            placeholder="Enter PO No / Reference"
          />
          {errors.poNoReference && <p className="text-xs text-danger-500 mt-1">{errors.poNoReference}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            PO Date
          </label>
          <input
            type="date"
            className={`input ${errors.poDate ? 'border-danger-500' : ''}`}
            value={formData.poDate || ''}
            onChange={(e) => updateFormData('poDate', e.target.value)}
          />
          {errors.poDate && <p className="text-xs text-danger-500 mt-1">{errors.poDate}</p>}
        </div>
      </div>
    </div>
  )
}

