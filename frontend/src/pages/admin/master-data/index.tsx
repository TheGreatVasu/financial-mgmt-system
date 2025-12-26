import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import Step1CompanyProfile from './Step1CompanyProfile'
import Step2CustomerProfile from './Step2CustomerProfile'
import Step3ConsigneeProfile from './Step3ConsigneeProfile'
import Step4PayerProfile from './Step4PayerProfile'
import Step5EmployeeProfile from './Step5EmployeeProfile'
import Step6PaymentTerms from './Step6PaymentTerms'
import Step7ReviewSubmit from './Step7ReviewSubmit'
// @ts-expect-error - Module exists but TypeScript has resolution issues
import masterDataService from '../../services/masterDataService'

interface MasterDataState {
  companyProfile?: any
  customerProfile?: any
  consigneeProfile?: any
  payerProfile?: any
  employeeProfile?: any
  paymentTerms?: any
}

const STORAGE_KEY = 'master_data_wizard_state'

export default function MasterDataWizard() {
  const navigate = useNavigate()
  
  const loadSavedState = (): { step: number; data: MasterDataState } => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { step: parsed.step || 1, data: parsed.data || {} }
      }
    } catch (err) {
      // Ignore parse errors
    }
    return { step: 1, data: {} }
  }

  const savedState = loadSavedState()
  const [currentStep, setCurrentStep] = useState(savedState.step)
  const [masterData, setMasterData] = useState<MasterDataState>(savedState.data)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step: currentStep,
        data: masterData,
        timestamp: Date.now()
      }))
    } catch (err) {
      // Ignore localStorage errors
    }
  }, [currentStep, masterData])

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
      setError(null)
      handleStepComplete(currentStep, data)
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
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
      setError(null)
      
      const finalData = { ...masterData }
      
      // Validate that we have at least the required sections
      if (!finalData.companyProfile || !finalData.customerProfile || !finalData.paymentTerms) {
        const missing: string[] = []
        if (!finalData.companyProfile) missing.push('Company Profile')
        if (!finalData.customerProfile) missing.push('Customer Profile')
        if (!finalData.paymentTerms) missing.push('Payment Terms')
        const errorMsg = `Please complete the following required sections: ${missing.join(', ')}`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }
      
      // Submit to backend
      await masterDataService.submitMasterData(finalData as any)
      
      // Show success message
      toast.success('Master Data Wizard Completed! Customer data has been synced to the system.')
      
      // Clear saved state from localStorage
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (err) {
        // Ignore localStorage errors
      }
      
      // Reset wizard after successful submission
      setTimeout(() => {
        setCurrentStep(1)
        setMasterData({})
        setError(null)
        navigate('/customers')
      }, 2000)
      
    } catch (err: any) {
      let errorMessage = 'Failed to complete wizard. Please try again.'
      
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err?.message) {
        errorMessage = err.message
      } else if (err?.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check server configuration.'
      } else if (err?.response?.status === 401) {
        errorMessage = 'Authentication expired. Please log in again and try submitting.'
      } else if (err?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later. Your data has been saved locally.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  useEffect(() => {
    if (currentStep === 7) setError(null)
  }, [currentStep])
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData = Object.keys(masterData).length > 0
      if (hasData) {
        e.preventDefault()
        e.returnValue = 'You have unsaved master data. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [masterData])

  const loadSampleData = () => {
    const sampleData: MasterDataState = {
      companyProfile: {
        companyName: 'Rastogi Coders Pvt. Ltd.',
        legalEntityName: 'Rastogi Coders Private Limited',
        corporateAddress: '2nd Floor, Sector 62, Noida',
        corporateDistrict: 'Gautam Buddh Nagar',
        corporateState: 'Uttar Pradesh',
        corporateCountry: 'India',
        corporatePinCode: '201309',
        correspondenceAddress: '2nd Floor, Sector 62, Noida',
        correspondenceDistrict: 'Gautam Buddh Nagar',
        correspondenceState: 'Uttar Pradesh',
        correspondenceCountry: 'India',
        correspondencePinCode: '201309',
        otherOfficeType: 'Branch Office',
        otherOfficeAddress: '3rd Floor, IT Park, Gomti Nagar',
        otherOfficeGst: '09AACCR1234F1Z9',
        otherOfficeDistrict: 'Lucknow',
        otherOfficeState: 'Uttar Pradesh',
        otherOfficeCountry: 'India',
        otherOfficePinCode: '226010',
        primaryContactName: 'Saurabh Mishra',
        primaryContactNumber: '+919876540001',
        primaryContactEmail: 'saurabh.mishra@gmail.com'
      },
      
      customerProfile: {
        customerName: 'Aashway Technologies',
        legalEntityName: 'Aashway Technologies Private Limited',
        corporateOfficeAddress: '3rd Floor, Sector 62, Noida',
        correspondenceAddress: '3rd Floor, Sector 62, Noida',
        district: 'Gautam Buddh Nagar',
        state: 'Uttar Pradesh',
        country: 'India',
        pinCode: '201309',
        segment: 'Domestic',
        gstNumber: '09ABCDE1234F1Z5',
        poIssuingAuthority: 'Kunal Verma',
        designation: 'Procurement Manager',
        contactNumber: '+919876540002',
        emailId: 'kunal.verma@gmail.com'
      },
      
      consigneeProfile: {
        consignees: [{
          consigneeName: 'Aashway Technologies – Noida Warehouse',
          consigneeAddress: 'Industrial Area, Phase 2, Noida',
          customerName: 'Aashway Technologies',
          legalEntityName: 'Aashway Technologies Private Limited',
          city: 'Noida',
          state: 'Uttar Pradesh',
          gstNumber: '09ABCDE1234F1Z5',
          contactPersonName: 'Ritika Sharma',
          designation: 'Warehouse Supervisor',
          contactNumber: '+919876540003',
          emailId: 'ritika.sharma@gmail.com'
        }]
      },
      
      payerProfile: {
        payers: [{
          payerName: 'Aashway Technologies',
          payerAddress: 'Accounts Department, Sector 62, Noida',
          customerName: 'Aashway Technologies',
          legalEntityName: 'Aashway Technologies Private Limited',
          city: 'Noida',
          state: 'Uttar Pradesh',
          gstNumber: '09ABCDE1234F1Z5',
          contactPersonName: 'Neeraj Gupta',
          designation: 'Accounts Manager',
          contactNumber: '+919876540004',
          emailId: 'neeraj.gupta@gmail.com'
        }]
      },
      
      employeeProfile: {
        teamMemberName: 'Aditya Singh',
        employeeId: 'RCPL-EMP-002',
        role: 'Business Development Manager',
        department: 'Sales & Marketing',
        contactNumber: '+919876540005',
        emailId: 'aditya.singh@gmail.com',
        reportingManager: 'Saurabh Mishra',
        location: 'Noida',
        accessLevel: 'Manager',
        remarks: 'Handles enterprise clients and key partnerships'
      },
      
      paymentTerms: {
        paymentTermName: 'Net 30',
        creditPeriod: '30',
        advanceRequired: 'No',
        advancePercentage: '',
        balancePaymentDueDays: '30',
        latePaymentInterest: '1.5% per month',
        billingCycle: 'Monthly',
        paymentMethod: 'Bank Transfer',
        bankName: 'HDFC Bank',
        bankAccountNumber: '50200012345678',
        ifscCode: 'HDFC0000123',
        upiId: 'rastogicoders@hdfcbank',
        notes: 'Payment due within 30 days from invoice date'
      }
    }      
    
    setMasterData(sampleData)
    setCurrentStep(1)
    toast.success('Sample data loaded! You can now navigate through the steps to review it.')
  }

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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Creation of Master Data
              </h1>
              <p className="text-gray-600">
                Stepwise onboarding for company, customer, payment, and team details
              </p>
            </div>
            {Object.keys(masterData).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Auto-saved</span>
              </div>
            )}
          </div>
          
          {/* Load Sample Data Button - Prominent Placement */}
          <div className="mb-4">
            <button
              type="button"
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-600 hover:border-blue-600 hover:shadow-xl transition-all duration-200 active:scale-95"
              title="Load sample data for testing all form fields"
            >
              <Plus className="h-5 w-5" />
              Load Sample Data
            </button>
            <p className="text-xs text-gray-500 mt-2 ml-1">
              Click to automatically fill all form fields with sample data for testing
            </p>
          </div>
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
              customerData={masterData.customerProfile}
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

