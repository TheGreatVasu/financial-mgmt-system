import React from 'react'
import { BookOpen, CheckCircle2, Lock } from 'lucide-react'

interface StepIndexProps {
  currentStep: number
  completedSteps: Set<number>
  onSelectStep: (stepNumber: number) => void
  steps: Array<{
    number: number
    title: string
    description: string
    required?: boolean
  }>
}

const defaultSteps = [
  {
    number: 1,
    title: 'Company Profile',
    description: 'Enter your company details, registration numbers, and contact information',
    required: true
  },
  {
    number: 2,
    title: 'Customer Profile',
    description: 'Add customer details, business classification, and identification information',
    required: true
  },
  {
    number: 3,
    title: 'Consignee Profile',
    description: 'Enter consignee address, contact details, and delivery location information',
    required: false
  },
  {
    number: 4,
    title: 'Payer Profile',
    description: 'Specify who is responsible for payment, payment address, and payer details',
    required: false
  },
  {
    number: 5,
    title: 'Employee Profile',
    description: 'Add team members, account managers, and key contact persons',
    required: false
  },
  {
    number: 6,
    title: 'Payment Terms',
    description: 'Configure payment schedules, credit terms, and payment methods',
    required: true
  },
  {
    number: 7,
    title: 'Review & Submit',
    description: 'Review all information and submit your master data entry',
    required: true
  }
]

export default function StepIndex({
  currentStep,
  completedSteps,
  onSelectStep,
  steps = defaultSteps
}: StepIndexProps) {
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.has(stepNumber)) return 'completed'
    if (stepNumber === currentStep) return 'active'
    return 'pending'
  }

  const completedCount = completedSteps.size
  const totalSteps = steps.length
  const progressPercentage = (completedCount / totalSteps) * 100

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Master Data Wizard</h1>
        </div>
        <p className="text-gray-700 mb-6">
          Choose any step below to begin filling your master data. Complete all required fields marked with <span className="text-red-500">*</span>
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-700">Progress</span>
            <span className="text-blue-600">{completedCount} of {totalSteps} completed</span>
          </div>
          <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          const isCompleted = status === 'completed'
          const isActive = status === 'active'

          return (
            <button
              key={step.number}
              onClick={() => onSelectStep(step.number)}
              className={`text-left p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : isCompleted
                  ? 'border-green-300 bg-green-50 hover:border-green-400'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {/* Step Number and Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.number}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                      Step {step.number}
                    </h3>
                  </div>
                </div>
                {step.required && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded">
                    Required
                  </span>
                )}
              </div>

              {/* Step Title */}
              <h4 className={`text-lg font-semibold mb-2 ${
                isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-900'
              }`}>
                {step.title}
              </h4>

              {/* Step Description */}
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {step.description}
              </p>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </span>
                )}
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full animate-pulse">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    Current Step
                  </span>
                )}
                {!isCompleted && !isActive && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Not started
                  </span>
                )}
              </div>

              {/* Arrow Icon on Hover */}
              <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )
        })}
      </div>

      {/* Instructions Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How to use this Wizard:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Click on any step card above to start filling that section</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">2.</span>
            <span>You can jump between steps in any order - there's no fixed sequence</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Complete all required fields (marked with <span className="text-red-500 font-bold">*</span>) in each section</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">4.</span>
            <span>Once all required fields are filled, the Submit button will be available</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">5.</span>
            <span>Your progress is automatically saved as you complete each step</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
