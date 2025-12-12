import React from 'react'
import { CheckCircle } from 'lucide-react'

interface Step7ReviewSubmitProps {
  onSubmit?: (data: any) => void
  onPrevious?: () => void
  allData?: any
}

export default function Step7ReviewSubmit({
  onSubmit,
  onPrevious,
  allData = {},
}: Step7ReviewSubmitProps) {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(allData)
    } else {
      console.log('All Master Data:', allData)
      alert('Master Data Wizard Completed! Check console for data.')
    }
  }

  const renderSection = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]: [string, any]) => {
            if (value === null || value === undefined || value === '') return null
            if (typeof value === 'object' && !Array.isArray(value)) {
              return (
                <div key={key} className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </p>
                  <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              )
            }
            if (Array.isArray(value)) {
              return (
                <div key={key} className="col-span-2">
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {value.length} item(s)
                  </p>
                </div>
              )
            }
            return (
              <div key={key}>
                <p className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </p>
                <p className="text-sm text-gray-600 mt-1">{String(value)}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
        <p className="text-gray-600 mb-8">
          Please review all the information you've entered. Click Submit to complete the master data setup.
        </p>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {renderSection('Company Profile', allData.companyProfile)}
          {renderSection('Customer Profile', allData.customerProfile)}
          {renderSection('Consignee Profile', allData.consigneeProfile)}
          {renderSection('Payer Profile', allData.payerProfile)}
          {renderSection('Employee Profile', allData.employeeProfile)}
          {renderSection('Payment Terms', allData.paymentTerms)}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
          >
            Submit & Complete
          </button>
        </div>
      </div>
    </div>
  )
}

