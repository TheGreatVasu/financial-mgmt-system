import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const additionalStepSchema = z.object({
  additionalDocument: z.any().optional(),
  defaultCurrency: z.string().min(1, 'Default currency is required'),
  defaultTax: z.string().min(1, 'Default tax is required'),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  quotationPrefix: z.string().min(1, 'Quotation prefix is required'),
  enableBOQ: z.string().min(1, 'Please select Yes or No'),
  enableAutoInvoice: z.string().min(1, 'Please select Yes or No'),
  notificationEmail: z.string().email('Valid email required'),
  smsNotification: z.string().min(1, 'Please select Yes or No'),
  allowPartialDelivery: z.string().min(1, 'Please select Yes or No'),
  serviceCharge: z.string().min(1, 'Service charge is required'),
  remarks: z.string().optional().or(z.literal('')),
})

type AdditionalStepFormData = z.infer<typeof additionalStepSchema>

interface Step5AdditionalStepProps {
  onSubmit?: (data: AdditionalStepFormData) => void
  onPrevious?: () => void
  initialData?: Partial<AdditionalStepFormData>
}

export default function Step5AdditionalStep({
  onSubmit: handleFinalSubmit,
  onPrevious,
  initialData,
}: Step5AdditionalStepProps) {
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdditionalStepFormData>({
    resolver: zodResolver(additionalStepSchema),
    defaultValues: {
      ...initialData,
      additionalDocument: initialData?.additionalDocument || null,
    },
  })

  const onSubmit = (data: AdditionalStepFormData) => {
    if (handleFinalSubmit) {
      handleFinalSubmit(data)
    } else {
      console.log('Additional Step Data:', data)
    }
  }

  const FormField = ({
    label,
    name,
    type = 'text',
    placeholder,
    isTextarea = false,
    options,
    required = true,
    control: formControl,
    error,
  }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {name === 'additionalDocument' && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={formControl}
        render={({ field }) => {
          const baseClasses = `px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`

          if (type === 'file') {
            return (
              <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-white flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 rounded-lg bg-blue-50 overflow-hidden flex items-center justify-center">
                  {documentPreview ? (
                    <img
                      src={documentPreview}
                      alt="Document preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 text-2xl">
                      DOC
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {documentPreview ? 'Document uploaded' : 'Upload additional document'}
                  </p>
                  <p className="text-xs text-gray-500">PNG/JPG/PDF, max 5MB</p>
                </div>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-blue-700 transition">
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setDocumentPreview(reader.result as string)
                        }
                        if (file.type.startsWith('image/')) {
                          reader.readAsDataURL(file)
                        } else {
                          // For non-image files like PDF, use a placeholder
                          setDocumentPreview('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxRTQwQjciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1maWxlLXRleHQiPjxwYXRoIGQ9Ik0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOXoiLz48cGF0aCBkPSJNMTQgMnY2aDYiLz48cGF0aCBkPSJNMTYgMTNIOCIvPjxwYXRoIGQ9Ik0xNiAxN0gxNCIvPjxwYXRoIGQ9Ik0xMCAxN0g4di4wMSIvPjwvc3ZnPg==')
                        }
                        field.onChange(file)
                      } else {
                        setDocumentPreview(null)
                        field.onChange(null)
                      }
                    }}
                  />
                </label>
                {field.value && (
                  <span className="text-xs text-gray-600 truncate max-w-full">
                    {typeof field.value === 'string' ? field.value : field.value?.name}
                  </span>
                )}
              </div>
            )
          }

          if (isTextarea) {
            return (
              <textarea
                {...field}
                placeholder={placeholder}
                className={baseClasses}
                rows={3}
              />
            )
          }

          if (options) {
            return (
              <select
                {...field}
                className={baseClasses}
              >
                <option value="">Select {label}</option>
                {options.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )
          }

          return (
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={baseClasses}
            />
          )
        }}
      />
      {error && <span className="text-xs text-red-500">{error.message}</span>}
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Additional Details</h2>
        <p className="text-gray-600 mb-6">Configure additional settings for your system</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <FormField
                label="Additional Document"
                name="additionalDocument"
                type="file"
                control={control}
                error={errors.additionalDocument}
              />
            </div>
            <FormField
              label="Default Currency"
              name="defaultCurrency"
              placeholder="Enter currency code (e.g., INR, USD)"
              control={control}
              error={errors.defaultCurrency}
            />
            <FormField
              label="Default Tax %"
              name="defaultTax"
              type="number"
              step="0.01"
              placeholder="Enter default tax percentage"
              control={control}
              error={errors.defaultTax}
            />
            <FormField
              label="Invoice Prefix"
              name="invoicePrefix"
              placeholder="Enter invoice prefix (e.g., INV)"
              control={control}
              error={errors.invoicePrefix}
            />
            <FormField
              label="Quotation Prefix"
              name="quotationPrefix"
              placeholder="Enter quotation prefix (e.g., QT)"
              control={control}
              error={errors.quotationPrefix}
            />
            <FormField
              label="Enable BOQ"
              name="enableBOQ"
              control={control}
              error={errors.enableBOQ}
              options={['Yes', 'No']}
            />
            <FormField
              label="Enable Auto-Invoice"
              name="enableAutoInvoice"
              control={control}
              error={errors.enableAutoInvoice}
              options={['Yes', 'No']}
            />
            <FormField
              label="Notification Email"
              name="notificationEmail"
              type="email"
              placeholder="Enter notification email"
              control={control}
              error={errors.notificationEmail}
            />
            <FormField
              label="SMS Notification"
              name="smsNotification"
              control={control}
              error={errors.smsNotification}
              options={['Yes', 'No']}
            />
            <FormField
              label="Allow Partial Delivery"
              name="allowPartialDelivery"
              control={control}
              error={errors.allowPartialDelivery}
              options={['Yes', 'No']}
            />
            <FormField
              label="Service Charge %"
              name="serviceCharge"
              type="number"
              step="0.01"
              placeholder="Enter service charge percentage"
              control={control}
              error={errors.serviceCharge}
            />
            <div className="col-span-2">
              <FormField
                label="Remarks"
                name="remarks"
                placeholder="Enter remarks (optional)"
                control={control}
                error={errors.remarks}
                isTextarea
                required={false}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onPrevious}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Previous
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
