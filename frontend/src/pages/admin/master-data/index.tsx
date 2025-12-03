import React, { useState } from 'react'
import Step1CompanyProfile from './Step1CompanyProfile'
import Step2CustomerProfile from './Step2CustomerProfile'
import Step3PaymentTerms from './Step3PaymentTerms'
import Step4TeamProfiles from './Step4TeamProfiles'
import Step5AdditionalStep from './Step5AdditionalStep'

interface MasterDataState {
  companyProfile?: any
  customerProfile?: any
  paymentTerms?: any
  teamProfiles?: any
  additionalStep?: any
}

export default function MasterDataWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [masterData, setMasterData] = useState<MasterDataState>({})
  const [error, setError] = useState<string | null>(null)

  const handleStepComplete = (stepNumber: number, data: any) => {
    const stepKeys = [
      'companyProfile',
      'customerProfile',
      'paymentTerms',
      'teamProfiles',
      'additionalStep',
    ]
    setMasterData((prev) => ({
      ...prev,
      [stepKeys[stepNumber - 1]]: data,
    }))
    setError(null)
  }

  const handleNext = (data: any) => {
    try {
      handleStepComplete(currentStep, data)
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      console.error('Error:', err)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleFinalSubmit = (data: any) => {
    try {
      handleStepComplete(5, data)
      const finalData = {
        ...masterData,
        additionalStep: data,
      }
      console.log('All Master Data:', finalData)
      // Here you would typically send all data to your backend API
      alert('Master Data Wizard Completed! Check console for data.')
      // Optional: Reset wizard or redirect
      // setCurrentStep(1)
      // setMasterData({})
    } catch (err: any) {
      setError(err.message || 'Failed to complete wizard. Please try again.')
      console.error('Error:', err)
    }
  }

  const progressPercentage = ((currentStep - 1) / 4) * 100 // Adjusted for 4 steps (0-100%)
  const steps = [
    { number: 1, title: 'Company Profile', short: 'Company' },
    { number: 2, title: 'Customer Profile', short: 'Customer' },
    { number: 3, title: 'Payment Terms', short: 'Payment' },
    { number: 4, title: 'Team Profiles', short: 'Team' },
    { number: 5, title: 'Additional Step', short: 'Additional' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Master Data Setup Wizard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto md:mx-0">
            Complete all steps to configure your financial management system
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
            <Step3PaymentTerms
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.paymentTerms}
            />
          )}
          {currentStep === 4 && (
            <Step4TeamProfiles
              onNext={handleNext}
              onPrevious={handlePrevious}
              initialData={masterData.teamProfiles}
            />
          )}
          {currentStep === 5 && (
            <Step5AdditionalStep
              onSubmit={handleFinalSubmit}
              onPrevious={handlePrevious}
              initialData={masterData.additionalStep}
            />
          )}
        </div>

        {/* Step Counter */}
        <div className="text-center text-sm text-gray-600 py-4 border-t">
          Step {currentStep} of 5 - {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  )
}
