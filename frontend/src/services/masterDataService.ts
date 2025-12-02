import apiClient from './apiClient'

export interface CompanyProfileData {
  companyName: string
  legalEntityName: string
  corporateOfficeAddress: string
  district: string
  state: string
  country: string
  pinCode: string
  correspondenceAddress: string
  gstin: string
  panNumber: string
  cinNumber: string
  businessType: string
  businessUnit: string
  website?: string
  emailId: string
  contactNumber: string
}

export interface CustomerProfileData {
  customerName: string
  customerCode: string
  gstin: string
  panNumber: string
  companyType: string
  segment: string
  region: string
  zone: string
  billingAddress: string
  shippingAddress: string
  contactPersonName: string
  contactPersonNumber: string
  contactEmailId: string
  creditPeriod: string
  paymentTerms: string
  deliveryTerms: string
  projectManager: string
  anyHold: string
  remarks?: string
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
      const response = await apiClient.post('/api/admin/master-data', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit master data')
    }
  },

  // Get existing master data
  getMasterData: async () => {
    try {
      const response = await apiClient.get('/api/admin/master-data')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch master data')
    }
  },

  // Update specific section
  updateCompanyProfile: async (data: CompanyProfileData) => {
    try {
      const response = await apiClient.put('/api/admin/master-data/company-profile', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update company profile')
    }
  },

  updateCustomerProfile: async (data: CustomerProfileData) => {
    try {
      const response = await apiClient.put('/api/admin/master-data/customer-profile', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update customer profile')
    }
  },

  updatePaymentTerms: async (data: PaymentTermsData) => {
    try {
      const response = await apiClient.put('/api/admin/master-data/payment-terms', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment terms')
    }
  },

  updateTeamProfiles: async (data: TeamProfileData) => {
    try {
      const response = await apiClient.put('/api/admin/master-data/team-profiles', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update team profiles')
    }
  },

  updateAdditionalStep: async (data: AdditionalStepData) => {
    try {
      const response = await apiClient.put('/api/admin/master-data/additional-step', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update additional step')
    }
  },

  // Get completion status
  getWizardStatus: async () => {
    try {
      const response = await apiClient.get('/api/admin/master-data/status')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch wizard status')
    }
  },
}

export default masterDataService
