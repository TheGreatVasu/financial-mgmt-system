import { createApiClient } from './apiClient'

// Helper to get fresh token each time
function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('fms_token') || localStorage.getItem('token') || null
}

// Helper to create API client with fresh token
function getApiClient() {
  const token = getToken()
  return createApiClient(token || undefined)
}

export interface CompanyProfileData {
  logo?: File | null
  companyName: string
  legalEntityName: string

  corporateAddress: string
  corporateDistrict: string
  corporateState: string
  corporateCountry: string
  corporatePinCode: string

  correspondenceAddress: string
  correspondenceDistrict: string
  correspondenceState: string
  correspondenceCountry: string
  correspondencePinCode: string

  otherOfficeType: 'Plant Address' | 'Site Office' | 'Marketing Office' | string
  otherOfficeAddress: string
  otherOfficeGst: string
  otherOfficeDistrict: string
  otherOfficeState: string
  otherOfficeCountry: string
  otherOfficePinCode: string

  primaryContactName: string
  primaryContactNumber: string
  primaryContactEmail: string
}

export interface CustomerProfileData {
  logo?: string
  customerName: string
  legalEntityName: string
  corporateOfficeAddress: string
  correspondenceAddress: string
  district: string
  state: string
  country: string
  pinCode: string
  segment: 'Domestic' | 'Export'
  gstNumber: string
  poIssuingAuthority: string
  designation: string
  contactNumber: string
  emailId: string
}

export interface PaymentTermsData {
  paymentTermName: string
  creditPeriod: string
  advanceRequired: string
  advancePercentage?: string
  balancePaymentDueDays: string
  latePaymentInterest: string
  billingCycle: string
  paymentMethod: string
  bankName: string
  bankAccountNumber: string
  ifscCode: string
  upiId?: string
  notes?: string
}

export interface TeamProfileData {
  teamMemberName: string
  employeeId: string
  role: string
  department: string
  contactNumber: string
  emailId: string
  reportingManager: string
  location: string
  accessLevel: string
  remarks?: string
}

export interface AdditionalStepData {
  defaultCurrency: string
  defaultTax: string
  invoicePrefix: string
  quotationPrefix: string
  enableBOQ: string
  enableAutoInvoice: string
  notificationEmail: string
  smsNotification: string
  allowPartialDelivery: string
  serviceCharge: string
  remarks?: string
}

export interface CompleteMasterData {
  companyProfile: CompanyProfileData
  customerProfile: CustomerProfileData
  paymentTerms: PaymentTermsData
  teamProfiles: TeamProfileData
  additionalStep: AdditionalStepData
}

const masterDataService = {
  // Submit entire master data wizard
  submitMasterData: async (data: CompleteMasterData) => {
    try {
      const apiClient = getApiClient()
      const token = getToken()
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }
      const response = await apiClient.post('/admin/master-data', data)
      return response.data
    } catch (error: any) {
      console.error('Master data submission error:', error)
      if (error.response?.status === 401) {
        throw new Error('Authentication expired. Please log in again.')
      }
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit master data'
      throw new Error(errorMessage)
    }
  },

  // Get existing master data
  getMasterData: async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/admin/master-data')
      return response.data
    } catch (error: any) {
      console.error('Master data fetch error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch master data'
      throw new Error(errorMessage)
    }
  },

  // Update specific section
  updateCompanyProfile: async (data: CompanyProfileData) => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.put('/admin/master-data/company-profile', data)
      return response.data
    } catch (error: any) {
      console.error('Company profile update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update company profile'
      throw new Error(errorMessage)
    }
  },

  updateCustomerProfile: async (data: CustomerProfileData) => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.put('/admin/master-data/customer-profile', data)
      return response.data
    } catch (error: any) {
      console.error('Customer profile update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer profile'
      throw new Error(errorMessage)
    }
  },

  updatePaymentTerms: async (data: PaymentTermsData) => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.put('/admin/master-data/payment-terms', data)
      return response.data
    } catch (error: any) {
      console.error('Payment terms update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update payment terms'
      throw new Error(errorMessage)
    }
  },

  updateTeamProfiles: async (data: TeamProfileData) => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.put('/admin/master-data/team-profiles', data)
      return response.data
    } catch (error: any) {
      console.error('Team profiles update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update team profiles'
      throw new Error(errorMessage)
    }
  },

  updateAdditionalStep: async (data: AdditionalStepData) => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.put('/admin/master-data/additional-step', data)
      return response.data
    } catch (error: any) {
      console.error('Additional step update error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update additional step'
      throw new Error(errorMessage)
    }
  },

  // Get completion status
  getWizardStatus: async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get('/admin/master-data/status')
      return response.data
    } catch (error: any) {
      console.error('Wizard status fetch error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch wizard status'
      throw new Error(errorMessage)
    }
  },
}

export default masterDataService
