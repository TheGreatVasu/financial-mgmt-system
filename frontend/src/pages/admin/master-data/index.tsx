import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Step1CompanyProfile from './Step1CompanyProfile'
import Step2CustomerProfile from './Step2CustomerProfile'
import Step3ConsigneeProfile from './Step3ConsigneeProfile'
import Step4PayerProfile from './Step4PayerProfile'
import Step5EmployeeProfile from './Step5EmployeeProfile'
import Step6PaymentTerms from './Step6PaymentTerms'
import Step7ReviewSubmit from './Step7ReviewSubmit'

interface MasterDataState {
  companyProfile?: any
  customerProfile?: any
  consigneeProfile?: any
  payerProfile?: any
  employeeProfile?: any
  paymentTerms?: any
}

export default function MasterDataWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [masterData, setMasterData] = useState<MasterDataState>({})
  const [error, setError] = useState<string | null>(null)

  const handleStepComplete = (stepNumber: number, data: any) => {
    const stepKeys = [
      'companyProfile',
      'customerProfile',
      'consigneeProfile',
      'payerProfile',
      'employeeProfile',
      'paymentTerms',
    ]
    setMasterData((prev) => ({
      ...prev,
      [stepKeys[stepNumber - 1]]: data,
    }))
    setError(null)
  }

  const handleNext = (data: any) => {
    try {
      setError(null) // Clear any previous errors
      handleStepComplete(currentStep, data)
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      console.error('Error:', err)
      toast.error(err.message || 'An error occurred. Please try again.')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFinalSubmit = async (data: any) => {
    try {
      setError(null) // Clear any previous errors
      
      const finalData = {
        ...masterData,
      }
      
      // Validate that we have at least the required sections
      if (!finalData.companyProfile || !finalData.customerProfile || !finalData.paymentTerms) {
        const missing = []
        if (!finalData.companyProfile) missing.push('Company Profile')
        if (!finalData.customerProfile) missing.push('Customer Profile')
        if (!finalData.paymentTerms) missing.push('Payment Terms')
        throw new Error(`Please complete the following required sections: ${missing.join(', ')}`)
      }
      
      // Import master data service
      const masterDataService = (await import('../../services/masterDataService')).default
      
      // Submit to backend
      const response = await masterDataService.submitMasterData(finalData)
      
      // Show success message
      toast.success('Master Data Wizard Completed! Customer data has been synced to the system.')
      
      // Reset wizard after successful submission
      setTimeout(() => {
        setCurrentStep(1)
        setMasterData({})
        setError(null)
        // Redirect to customers page
        navigate('/customers')
      }, 2000)
      
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to complete wizard. Please try again.'
      setError(errorMessage)
      console.error('Error submitting master data:', err)
      toast.error(errorMessage)
    }
  }

  // Clear errors when reaching review step (step 7)
  useEffect(() => {
    if (currentStep === 7) {
      setError(null) // Clear any stale errors when reaching review step
    }
  }, [currentStep])

  const progressPercentage = ((currentStep - 1) / 6) * 100 // Adjusted for 6 steps (0-100%)
  const steps = [
    { number: 1, title: 'Company Profile', short: 'Company' },
    { number: 2, title: 'Customer Profile', short: 'Customer' },
    { number: 3, title: 'Consignee Profile', short: 'Consignee' },
    { number: 4, title: 'Payer Profile', short: 'Payer' },
    { number: 5, title: 'Employee Profile', short: 'Employee' },
    { number: 6, title: 'Payment Terms', short: 'Payment' },
    { number: 7, title: 'Review & Submit', short: 'Review' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Creation of Master Data
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto md:mx-0">
            Stepwise onboarding for company, customer, payment, and team details
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <div className="mt-2">
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Progress Bar */}
        <div className="mb-12 px-4 sm:px-8">
          {/* Progress Info */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {steps[currentStep - 1]?.title || 'Setup Progress'}
            </h2>
            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={steps.length}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-6 relative">
              {steps.map((step) => {
                const isCompleted = step.number < currentStep
                const isActive = step.number === currentStep
                const isUpcoming = step.number > currentStep
                
                return (
                  <button
                    key={step.number}
                    onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                    className={`flex flex-col items-center group relative focus:outline-none ${
                      isCompleted ? 'cursor-pointer' : 'cursor-default'
                    }`}
                    disabled={!isCompleted}
                    aria-label={`Step ${step.number}: ${step.title}`}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 text-white shadow-md hover:shadow-lg hover:scale-110' 
                          : isActive 
                            ? 'bg-white border-indigo-600 text-indigo-700 shadow-lg scale-110' 
                            : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`font-semibold ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>
                          {step.number}
                        </span>
                      )}
                    </div>
                    
                    {/* Step Title */}
                    <span 
                      className={`mt-2 text-xs font-medium text-center transition-colors duration-200 ${
                        isActive ? 'text-indigo-700 font-semibold' : 'text-gray-500'
                      }`}
                    >
                      {step.short}
                    </span>
                    
                    {/* Connector Line */}
                    {step.number < steps.length && (
                      <div className="absolute top-5 left-10 right-0 h-0.5 bg-gray-200 -z-10">
                        {isCompleted && (
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500 ease-out"
                            style={{ width: '100%' }}
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                        {step.title}
                      </div>
                      <div className="w-2 h-2 bg-gray-900 transform rotate-45 -mt-1 mx-auto"></div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Steps Container */}
        <div className="mb-8 min-h-[500px]">
          {currentStep === 1 && (
            <Step1CompanyProfile
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.companyProfile}
            />
          )}
          {currentStep === 2 && (
            <Step2CustomerProfile
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.customerProfile}
            />
          )}
          {currentStep === 3 && (
            <Step3ConsigneeProfile
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.consigneeProfile}
            />
          )}
          {currentStep === 4 && (
            <Step4PayerProfile
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.payerProfile}
            />
          )}
          {currentStep === 5 && (
            <Step5EmployeeProfile
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.employeeProfile}
            />
          )}
          {currentStep === 6 && (
            <Step6PaymentTerms
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.paymentTerms}
            />
          )}
          {currentStep === 7 && (
            <Step7ReviewSubmit
              onSubmit={handleFinalSubmit}
              onPrevious={handlePrevious}
              allData={masterData}
            />
          )}
        </div>

        {/* Step Counter */}
        <div className="text-center text-sm text-gray-600 py-4 border-t">
          Step {currentStep} of 7 - {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  )
}

