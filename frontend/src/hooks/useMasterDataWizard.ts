import { useState, useCallback } from 'react'

export interface MasterDataForm {
  companyProfile?: any
  customerProfile?: any
  paymentTerms?: any
  teamProfiles?: any
  additionalStep?: any
}

export interface MasterDataWizardHook {
  currentStep: number
  masterData: MasterDataForm
  setCurrentStep: (step: number) => void
  updateStepData: (stepNumber: number, data: any) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  canGoToNextStep: () => boolean
  canGoToPreviousStep: () => boolean
  resetWizard: () => void
  getAllData: () => MasterDataForm
}

export function useMasterDataWizard(): MasterDataWizardHook {
  const [currentStep, setCurrentStep] = useState(1)
  const [masterData, setMasterData] = useState<MasterDataForm>({})

  const updateStepData = useCallback((stepNumber: number, data: any) => {
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
  }, [])

  const goToNextStep = useCallback(() => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const canGoToNextStep = useCallback(() => currentStep < 5, [currentStep])

  const canGoToPreviousStep = useCallback(() => currentStep > 1, [currentStep])

  const resetWizard = useCallback(() => {
    setCurrentStep(1)
    setMasterData({})
  }, [])

  const getAllData = useCallback(() => masterData, [masterData])

  return {
    currentStep,
    masterData,
    setCurrentStep,
    updateStepData,
    goToNextStep,
    goToPreviousStep,
    canGoToNextStep,
    canGoToPreviousStep,
    resetWizard,
    getAllData,
  }
}
