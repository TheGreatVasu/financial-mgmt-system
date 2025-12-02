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
  }

  const handleNext = (data: any) => {
    handleStepComplete(currentStep, data)
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = (data: any) => {
    handleStepComplete(5, data)
    console.log('All Master Data:', {
      ...masterData,
      additionalStep: data,
    })
    // Here you would typically send all data to your backend API
    alert('Master Data Wizard Completed! Check console for data.')
  }

  const progressPercentage = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Data Setup Wizard</h1>
          <p className="text-gray-600">Complete all steps to configure your financial management system</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                    step === currentStep
                      ? 'bg-blue-600 text-white'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">
                  {step === 1 && 'Company'}
                  {step === 2 && 'Customer'}
                  {step === 3 && 'Payment'}
                  {step === 4 && 'Team'}
                  {step === 5 && 'Additional'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8">
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
        <div className="text-center text-sm text-gray-600">
          Step {currentStep} of 5
        </div>
      </div>
    </div>
  )
}
