/**
 * Master Data Service
 * Handles all API calls for master data management (company profile, customer profile, etc.)
 */

import axios from 'axios'

function getApiBaseUrl() {
  // Use relative URLs for API calls - Vite proxy will handle routing
  // In development: Vite proxy routes /api to http://localhost:5000
  // In production: API will be on same domain
  return ''
}

/**
 * Get current user's token from localStorage or session
 */
function getAuthToken() {
  // Try to get from localStorage first (standard location)
  let token = localStorage.getItem('token')
  
  // If not found, try sessionStorage
  if (!token) {
    token = sessionStorage.getItem('token')
  }
  
  return token
}

/**
 * Create axios instance with auth headers
 */
function createAxiosInstance(token) {
  const baseURL = getApiBaseUrl()
  
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Add authorization header if token exists
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  return instance
}

/**
 * Fetch existing master data for the current user
 */
export async function getMasterData() {
  try {
    const token = getAuthToken()
    if (!token) {
      console.warn('No auth token found, cannot fetch master data')
      return null
    }

    const axiosInstance = createAxiosInstance(token)
    const response = await axiosInstance.get('/api/admin/master-data')
    
    if (response.data?.success) {
      return response.data.data || {}
    }
    
    return null
  } catch (error) {
    console.error('Error fetching master data:', error)
    // Return empty object on error (no master data exists yet)
    return null
  }
}

/**
 * Submit/save master data for the current user
 * This includes company profile, customer profile, consignee, payer, payment terms, and team profiles
 * Supports partial saves (merging with existing data)
 */
export async function submitMasterData(payload) {
  try {
    // Step 1: Validate authentication
    const token = getAuthToken()
    if (!token) {
      throw new Error('Authentication required. Please log in again.')
    }

    // Step 2: Validate payload structure
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload format')
    }

    // Step 3: Create axios instance with auth
    const axiosInstance = createAxiosInstance(token)
    
    // Step 4: Send POST request to backend
    const response = await axiosInstance.post('/api/admin/master-data', payload, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Step 5: Handle successful response
    if (response.data?.success) {
      console.log('Master data saved successfully:', response.data.data)
      return response.data.data || {}
    }
    
    // Step 6: Handle error response from backend
    throw new Error(response.data?.message || 'Failed to save master data')
  } catch (error) {
    console.error('Error submitting master data:', {
      message: error.message,
      code: error.code,
      response: error.response?.data
    })
    throw error
  }
}

/**
 * Update specific section of master data
 */
export async function updateMasterDataSection(section, data) {
  try {
    const token = getAuthToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const axiosInstance = createAxiosInstance(token)
    const response = await axiosInstance.put(`/api/admin/master-data/${section}`, data)
    
    if (response.data?.success) {
      return response.data.data || {}
    }
    
    throw new Error(response.data?.message || `Failed to update ${section}`)
  } catch (error) {
    console.error(`Error updating master data section ${section}:`, error)
    throw error
  }
}

/**
 * Get completion status of master data sections
 */
export async function getMasterDataStatus() {
  try {
    const token = getAuthToken()
    if (!token) {
      console.warn('No auth token found, cannot fetch master data status')
      return {
        companyProfile: false,
        customerProfile: false,
        consigneeProfiles: false,
        payerProfiles: false,
        paymentTerms: false,
        teamProfiles: false,
        additionalStep: false,
        completed: 0,
        total: 7,
        percent: 0
      }
    }

    const axiosInstance = createAxiosInstance(token)
    const response = await axiosInstance.get('/api/admin/master-data/status')
    
    if (response.data?.success) {
      return response.data.data || {}
    }
    
    return null
  } catch (error) {
    console.error('Error fetching master data status:', error)
    return null
  }
}

export default {
  getMasterData,
  submitMasterData,
  updateMasterDataSection,
  getMasterDataStatus
}
