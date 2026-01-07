import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { Building2, Users, FileText, CreditCard, UserCheck, ArrowRight } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Company Profile', icon: Building2, description: 'Enter company details, logo, and basic information' },
  { id: 2, label: 'Customer Profile', icon: Users, description: 'Add customer information and contact details' },
  { id: 3, label: 'Consignee Profile', icon: FileText, description: 'Configure consignee addresses and details' },
  { id: 4, label: 'Payer Profile', icon: CreditCard, description: 'Set up payer information and billing details' },
  { id: 5, label: 'Payment Terms', icon: FileText, description: 'Define payment terms and conditions' },
  { id: 6, label: 'Team Profiles', icon: UserCheck, description: 'Add team members and their roles' }
]

export default function MasterDataStepSelection() {
  const navigate = useNavigate()

  const handleStepClick = (stepId) => {
    navigate(`/customers/new/form?step=${stepId}`)
  }

  // Debug: Log when component renders
  console.log('MasterDataStepSelection component rendering')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-secondary-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-secondary-900">Creation of Master Data</h1>
            <p className="text-sm text-secondary-600">Select a step below to begin filling your master data. Complete all required fields marked with <span className="text-red-500">*</span></p>
          </div>
        </div>

        {/* Steps Grid/Table */}
        <div className="rounded-2xl border border-secondary-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className="group relative flex flex-col rounded-xl border-2 border-secondary-200 bg-white p-5 text-left shadow-sm transition-all hover:border-primary-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number Circle */}
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary-500 bg-primary-50 text-primary-700">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-base font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors">
                          {step.label}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-secondary-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                      </div>
                      <p className="text-sm text-secondary-600 mb-2">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs font-medium text-secondary-700">
                          Step {step.id}
                        </span>
                        <span className="text-xs text-secondary-500">Click to open</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-xl bg-primary-50 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Getting Started</h4>
              <p className="text-sm text-blue-700">
                Click on any step above to start filling in the master data. You can navigate between steps at any time. 
                All steps must be completed before submitting the master data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

