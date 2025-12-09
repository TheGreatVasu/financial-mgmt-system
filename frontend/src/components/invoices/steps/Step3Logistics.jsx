export default function Step3Logistics({ formData, updateFormData, errors, consigneeOptions = [], payerOptions = [] }) {
  const handleAddressSelect = (field, value) => {
    updateFormData(field, value || '')
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-secondary-200 pb-3">
        <h3 className="text-lg font-semibold text-secondary-900">Consignee, Payer & Logistics Tracking</h3>
        <p className="text-sm text-secondary-600 mt-1">Enter consignee details, payer information, and logistics tracking data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Consignee Name & Address
            </label>
            <select
              className="input"
              value=""
              onChange={(e) => handleAddressSelect('consigneeNameAddress', e.target.value)}
              disabled={!consigneeOptions.length}
            >
              <option value="">{consigneeOptions.length ? 'Select from Master Data' : 'No master data available'}</option>
              {consigneeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label || option.value}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 mt-1">Selecting an option will auto-fill the address below.</p>
          </div>
          <textarea
            className={`input min-h-[80px] ${errors.consigneeNameAddress ? 'border-danger-500' : ''}`}
            value={formData.consigneeNameAddress || ''}
            onChange={(e) => updateFormData('consigneeNameAddress', e.target.value)}
            placeholder="Select from master data or enter Consignee Name & Address"
          />
          {errors.consigneeNameAddress && <p className="text-xs text-danger-500">{errors.consigneeNameAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Consignee City
          </label>
          <input
            type="text"
            className={`input ${errors.consigneeCity ? 'border-danger-500' : ''}`}
            value={formData.consigneeCity || ''}
            onChange={(e) => updateFormData('consigneeCity', e.target.value)}
            placeholder="Enter Consignee City"
          />
          {errors.consigneeCity && <p className="text-xs text-danger-500 mt-1">{errors.consigneeCity}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Payer Name & Address
            </label>
            <select
              className="input"
              value=""
              onChange={(e) => handleAddressSelect('payerNameAddress', e.target.value)}
              disabled={!payerOptions.length}
            >
              <option value="">{payerOptions.length ? 'Select from Master Data' : 'No master data available'}</option>
              {payerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label || option.value}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 mt-1">Selecting an option will auto-fill the address below.</p>
          </div>
          <textarea
            className={`input min-h-[80px] ${errors.payerNameAddress ? 'border-danger-500' : ''}`}
            value={formData.payerNameAddress || ''}
            onChange={(e) => updateFormData('payerNameAddress', e.target.value)}
            placeholder="Select from master data or enter Payer Name & Address"
          />
          {errors.payerNameAddress && <p className="text-xs text-danger-500">{errors.payerNameAddress}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            City
          </label>
          <input
            type="text"
            className={`input ${errors.city ? 'border-danger-500' : ''}`}
            value={formData.city || ''}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="Enter City"
          />
          {errors.city && <p className="text-xs text-danger-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Lorry Receipt No
          </label>
          <input
            type="text"
            className={`input ${errors.lorryReceiptNo ? 'border-danger-500' : ''}`}
            value={formData.lorryReceiptNo || ''}
            onChange={(e) => updateFormData('lorryReceiptNo', e.target.value)}
            placeholder="Enter Lorry Receipt No"
          />
          {errors.lorryReceiptNo && <p className="text-xs text-danger-500 mt-1">{errors.lorryReceiptNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Lorry Receipt Date
          </label>
          <input
            type="date"
            className={`input ${errors.lorryReceiptDate ? 'border-danger-500' : ''}`}
            value={formData.lorryReceiptDate || ''}
            onChange={(e) => updateFormData('lorryReceiptDate', e.target.value)}
          />
          {errors.lorryReceiptDate && <p className="text-xs text-danger-500 mt-1">{errors.lorryReceiptDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Transporter Name
          </label>
          <input
            type="text"
            className={`input ${errors.transporterName ? 'border-danger-500' : ''}`}
            value={formData.transporterName || ''}
            onChange={(e) => updateFormData('transporterName', e.target.value)}
            placeholder="Enter Transporter Name"
          />
          {errors.transporterName && <p className="text-xs text-danger-500 mt-1">{errors.transporterName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Delivery Challan No
          </label>
          <input
            type="text"
            className={`input ${errors.deliveryChallanNo ? 'border-danger-500' : ''}`}
            value={formData.deliveryChallanNo || ''}
            onChange={(e) => updateFormData('deliveryChallanNo', e.target.value)}
            placeholder="Enter Delivery Challan No"
          />
          {errors.deliveryChallanNo && <p className="text-xs text-danger-500 mt-1">{errors.deliveryChallanNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Delivery Challan Date
          </label>
          <input
            type="date"
            className={`input ${errors.deliveryChallanDate ? 'border-danger-500' : ''}`}
            value={formData.deliveryChallanDate || ''}
            onChange={(e) => updateFormData('deliveryChallanDate', e.target.value)}
          />
          {errors.deliveryChallanDate && <p className="text-xs text-danger-500 mt-1">{errors.deliveryChallanDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Material Inspection Request Date
          </label>
          <input
            type="date"
            className={`input ${errors.materialInspectionRequestDate ? 'border-danger-500' : ''}`}
            value={formData.materialInspectionRequestDate || ''}
            onChange={(e) => updateFormData('materialInspectionRequestDate', e.target.value)}
          />
          {errors.materialInspectionRequestDate && <p className="text-xs text-danger-500 mt-1">{errors.materialInspectionRequestDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Inspection Offer Date
          </label>
          <input
            type="date"
            className={`input ${errors.inspectionOfferDate ? 'border-danger-500' : ''}`}
            value={formData.inspectionOfferDate || ''}
            onChange={(e) => updateFormData('inspectionOfferDate', e.target.value)}
          />
          {errors.inspectionOfferDate && <p className="text-xs text-danger-500 mt-1">{errors.inspectionOfferDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Material Inspection Date
          </label>
          <input
            type="date"
            className={`input ${errors.materialInspectionDate ? 'border-danger-500' : ''}`}
            value={formData.materialInspectionDate || ''}
            onChange={(e) => updateFormData('materialInspectionDate', e.target.value)}
          />
          {errors.materialInspectionDate && <p className="text-xs text-danger-500 mt-1">{errors.materialInspectionDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Delivery Instruction Date
          </label>
          <input
            type="date"
            className={`input ${errors.deliveryInstructionDate ? 'border-danger-500' : ''}`}
            value={formData.deliveryInstructionDate || ''}
            onChange={(e) => updateFormData('deliveryInstructionDate', e.target.value)}
          />
          {errors.deliveryInstructionDate && <p className="text-xs text-danger-500 mt-1">{errors.deliveryInstructionDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Delivery Inspection / CIP Received Date
          </label>
          <input
            type="date"
            className={`input ${errors.deliveryInspectionCipReceivedDate ? 'border-danger-500' : ''}`}
            value={formData.deliveryInspectionCipReceivedDate || ''}
            onChange={(e) => updateFormData('deliveryInspectionCipReceivedDate', e.target.value)}
          />
          {errors.deliveryInspectionCipReceivedDate && <p className="text-xs text-danger-500 mt-1">{errors.deliveryInspectionCipReceivedDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            MICC Receipt Date
          </label>
          <input
            type="date"
            className={`input ${errors.miccReceiptDate ? 'border-danger-500' : ''}`}
            value={formData.miccReceiptDate || ''}
            onChange={(e) => updateFormData('miccReceiptDate', e.target.value)}
          />
          {errors.miccReceiptDate && <p className="text-xs text-danger-500 mt-1">{errors.miccReceiptDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Last Date of Dispatch
          </label>
          <input
            type="date"
            className={`input ${errors.lastDateOfDispatch ? 'border-danger-500' : ''}`}
            value={formData.lastDateOfDispatch || ''}
            onChange={(e) => updateFormData('lastDateOfDispatch', e.target.value)}
          />
          {errors.lastDateOfDispatch && <p className="text-xs text-danger-500 mt-1">{errors.lastDateOfDispatch}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice Ready Date
          </label>
          <input
            type="date"
            className={`input ${errors.invoiceReadyDate ? 'border-danger-500' : ''}`}
            value={formData.invoiceReadyDate || ''}
            onChange={(e) => updateFormData('invoiceReadyDate', e.target.value)}
          />
          {errors.invoiceReadyDate && <p className="text-xs text-danger-500 mt-1">{errors.invoiceReadyDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Courier Document No
          </label>
          <input
            type="text"
            className={`input ${errors.courierDocumentNo ? 'border-danger-500' : ''}`}
            value={formData.courierDocumentNo || ''}
            onChange={(e) => updateFormData('courierDocumentNo', e.target.value)}
            placeholder="Enter Courier Document No"
          />
          {errors.courierDocumentNo && <p className="text-xs text-danger-500 mt-1">{errors.courierDocumentNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Courier Document Date
          </label>
          <input
            type="date"
            className={`input ${errors.courierDocumentDate ? 'border-danger-500' : ''}`}
            value={formData.courierDocumentDate || ''}
            onChange={(e) => updateFormData('courierDocumentDate', e.target.value)}
          />
          {errors.courierDocumentDate && <p className="text-xs text-danger-500 mt-1">{errors.courierDocumentDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Courier Company Name
          </label>
          <input
            type="text"
            className={`input ${errors.courierCompanyName ? 'border-danger-500' : ''}`}
            value={formData.courierCompanyName || ''}
            onChange={(e) => updateFormData('courierCompanyName', e.target.value)}
            placeholder="Enter Courier Company Name"
          />
          {errors.courierCompanyName && <p className="text-xs text-danger-500 mt-1">{errors.courierCompanyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Bill Sent to Person Name
          </label>
          <input
            type="text"
            className={`input ${errors.billSentToPersonName ? 'border-danger-500' : ''}`}
            value={formData.billSentToPersonName || ''}
            onChange={(e) => updateFormData('billSentToPersonName', e.target.value)}
            placeholder="Enter Bill Sent to Person Name"
          />
          {errors.billSentToPersonName && <p className="text-xs text-danger-500 mt-1">{errors.billSentToPersonName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Bill Sent Date
          </label>
          <input
            type="date"
            className={`input ${errors.billSentDate ? 'border-danger-500' : ''}`}
            value={formData.billSentDate || ''}
            onChange={(e) => updateFormData('billSentDate', e.target.value)}
          />
          {errors.billSentDate && <p className="text-xs text-danger-500 mt-1">{errors.billSentDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Last Date of Material Receipt
          </label>
          <input
            type="date"
            className={`input ${errors.lastDateOfMaterialReceipt ? 'border-danger-500' : ''}`}
            value={formData.lastDateOfMaterialReceipt || ''}
            onChange={(e) => updateFormData('lastDateOfMaterialReceipt', e.target.value)}
          />
          {errors.lastDateOfMaterialReceipt && <p className="text-xs text-danger-500 mt-1">{errors.lastDateOfMaterialReceipt}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice Receipt Date
          </label>
          <input
            type="date"
            className={`input ${errors.invoiceReceiptDate ? 'border-danger-500' : ''}`}
            value={formData.invoiceReceiptDate || ''}
            onChange={(e) => updateFormData('invoiceReceiptDate', e.target.value)}
          />
          {errors.invoiceReceiptDate && <p className="text-xs text-danger-500 mt-1">{errors.invoiceReceiptDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice Receipt Person Name
          </label>
          <input
            type="text"
            className={`input ${errors.invoiceReceiptPersonName ? 'border-danger-500' : ''}`}
            value={formData.invoiceReceiptPersonName || ''}
            onChange={(e) => updateFormData('invoiceReceiptPersonName', e.target.value)}
            placeholder="Enter Invoice Receipt Person Name"
          />
          {errors.invoiceReceiptPersonName && <p className="text-xs text-danger-500 mt-1">{errors.invoiceReceiptPersonName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Material Verification Date
          </label>
          <input
            type="date"
            className={`input ${errors.materialVerificationDate ? 'border-danger-500' : ''}`}
            value={formData.materialVerificationDate || ''}
            onChange={(e) => updateFormData('materialVerificationDate', e.target.value)}
          />
          {errors.materialVerificationDate && <p className="text-xs text-danger-500 mt-1">{errors.materialVerificationDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            JVR Date
          </label>
          <input
            type="date"
            className={`input ${errors.jvrDate ? 'border-danger-500' : ''}`}
            value={formData.jvrDate || ''}
            onChange={(e) => updateFormData('jvrDate', e.target.value)}
          />
          {errors.jvrDate && <p className="text-xs text-danger-500 mt-1">{errors.jvrDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            SRN Date
          </label>
          <input
            type="date"
            className={`input ${errors.srnDate ? 'border-danger-500' : ''}`}
            value={formData.srnDate || ''}
            onChange={(e) => updateFormData('srnDate', e.target.value)}
          />
          {errors.srnDate && <p className="text-xs text-danger-500 mt-1">{errors.srnDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            MRC Date
          </label>
          <input
            type="date"
            className={`input ${errors.mrcDate ? 'border-danger-500' : ''}`}
            value={formData.mrcDate || ''}
            onChange={(e) => updateFormData('mrcDate', e.target.value)}
          />
          {errors.mrcDate && <p className="text-xs text-danger-500 mt-1">{errors.mrcDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice Submission at Site Date
          </label>
          <input
            type="date"
            className={`input ${errors.invoiceSubmissionAtSiteDate ? 'border-danger-500' : ''}`}
            value={formData.invoiceSubmissionAtSiteDate || ''}
            onChange={(e) => updateFormData('invoiceSubmissionAtSiteDate', e.target.value)}
          />
          {errors.invoiceSubmissionAtSiteDate && <p className="text-xs text-danger-500 mt-1">{errors.invoiceSubmissionAtSiteDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice forwarded to HO
          </label>
          <select
            className={`input ${errors.invoiceForwardedToHo ? 'border-danger-500' : ''}`}
            value={formData.invoiceForwardedToHo || ''}
            onChange={(e) => updateFormData('invoiceForwardedToHo', e.target.value)}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.invoiceForwardedToHo && <p className="text-xs text-danger-500 mt-1">{errors.invoiceForwardedToHo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Invoice forwarded for Payment
          </label>
          <select
            className={`input ${errors.invoiceForwardedForPayment ? 'border-danger-500' : ''}`}
            value={formData.invoiceForwardedForPayment || ''}
            onChange={(e) => updateFormData('invoiceForwardedForPayment', e.target.value)}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          {errors.invoiceForwardedForPayment && <p className="text-xs text-danger-500 mt-1">{errors.invoiceForwardedForPayment}</p>}
        </div>
      </div>
    </div>
  )
}

