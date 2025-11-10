import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'
import { LogIn, RefreshCw, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Google OAuth Configuration
// Note: Client Secret is not needed for client-side OAuth (it's only for server-side)
const CLIENT_ID = import.meta?.env?.VITE_GOOGLE_CLIENT_ID || '314260239831-ccsh2mg3bdbgijhtv51lue9ccsjdl4ct.apps.googleusercontent.com'
const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4']
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

// Feature flag: use server-side service account to access Sheets (no Google login popups)
const USE_SERVER_SHEETS = (import.meta?.env?.VITE_GOOGLE_SHEETS_VIA_SERVER || '').toString() === 'true'

// Default spreadsheet ID - user can change this (can be provided via env)
const DEFAULT_SPREADSHEET_ID = import.meta?.env?.VITE_DEFAULT_SHEET_ID || 'YOUR_SPREADSHEET_ID_HERE'
const DEFAULT_RANGE = 'Sheet1!A1:Z100'

import { useAuthContext } from '../../context/AuthContext.jsx'
import { createGoogleSheetsService } from '../../services/googleSheetsService'

export default function POEntry() {
  const { token } = useAuthContext()
  const [isSignedIn, setIsSignedIn] = useState(USE_SERVER_SHEETS ? true : false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [sheetData, setSheetData] = useState([])
  const [spreadsheetId, setSpreadsheetId] = useState(DEFAULT_SPREADSHEET_ID)
  const [range, setRange] = useState(DEFAULT_RANGE)
  const [gapiLoaded, setGapiLoaded] = useState(false)
  const [updateRange, setUpdateRange] = useState('Sheet1!A2:B2')
  const [updateValues, setUpdateValues] = useState(['Somil', '5000'])
  const gapiRef = useRef(null)

  // Load Google API script
  useEffect(() => {
    if (USE_SERVER_SHEETS) {
      // In server mode, fetch immediately if spreadsheet is configured
      setIsLoading(false)
      return
    }
    const loadGapi = () => {
      // Check if gapi is already loaded
      if (window.gapi) {
        setGapiLoaded(true)
        initializeGapi()
        return
      }

      // Load the Google API script
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          setGapiLoaded(true)
          initializeGapi()
        })
      }
      script.onerror = () => {
        toast.error('Failed to load Google API. Please check your internet connection.')
        setIsLoading(false)
      }
      document.body.appendChild(script)

      return () => {
        // Cleanup: remove script if component unmounts
        const existingScript = document.querySelector('script[src="https://apis.google.com/js/api.js"]')
        if (existingScript) {
          existingScript.remove()
        }
      }
    }

    loadGapi()
  }, [])

  // Initialize Google API
  const initializeGapi = async () => {
    try {
      await window.gapi.client.init({
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      })

      gapiRef.current = window.gapi

      // Check if user is already signed in
      const authInstance = window.gapi.auth2.getAuthInstance()
      const isSignedIn = authInstance.isSignedIn.get()
      setIsSignedIn(isSignedIn)
    } catch (error) {
      console.error('Error initializing Google API:', error)
      toast.error('Failed to initialize Google API. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign In
  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const authInstance = window.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      
      if (user) {
        setIsSignedIn(true)
        toast.success('Successfully signed in to Google!')
      }
    } catch (error) {
      console.error('Error signing in:', error)
      if (error.error === 'popup_closed_by_user') {
        toast.error('Sign-in was cancelled')
      } else {
        toast.error('Failed to sign in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign Out
  const handleSignOut = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      setIsSignedIn(false)
      setSheetData([])
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  // Refresh access token if needed
  const refreshTokenIfNeeded = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance()
      const user = authInstance.currentUser.get()
      const isAuthorized = user.hasGrantedScopes(SCOPES)
      
      if (!isAuthorized) {
        // Request authorization again
        await user.grant({ scope: SCOPES })
      }

      // Check if token is expired and refresh if needed
      const token = user.getAuthResponse().access_token
      if (!token) {
        await user.reloadAuthResponse()
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      // If refresh fails, sign out and require re-authentication
      await handleSignOut()
      throw new Error('Session expired. Please sign in again.')
    }
  }

  // Fetch data from Google Sheets
  const fetchSheetData = async () => {
    if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
      toast.error('Please enter a valid Google Sheet ID')
      return
    }

    try {
      setIsFetching(true)
      if (USE_SERVER_SHEETS) {
        const api = createGoogleSheetsService(token)
        const data = await api.fetchValues(spreadsheetId, range)
        const values = data?.values || []
        setSheetData(values)
        toast.success(`Successfully fetched ${values.length} rows`)
      } else {
        // Refresh token if needed
        await refreshTokenIfNeeded()
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetId,
          range: range
        })
        if (response.result.values) {
          setSheetData(response.result.values)
          toast.success(`Successfully fetched ${response.result.values.length} rows`)
        } else {
          setSheetData([])
          toast.info('Sheet is empty or range has no data')
        }
      }
    } catch (error) {
      console.error('Error fetching sheet data:', error)
      const status = error?.status || error?.response?.status
      if (status === 404) {
        toast.error('Spreadsheet not found. Please check the Sheet ID.')
      } else if (status === 403) {
        toast.error('Access denied. Please ensure the sheet is shared with your Google account.')
      } else if (!USE_SERVER_SHEETS && status === 401) {
        toast.error('Authentication expired. Please sign in again.')
        setIsSignedIn(false)
      } else {
        toast.error(`Failed to fetch data: ${error.result?.error?.message || error.message || error?.response?.data?.message || 'Unknown error'}`)
      }
    } finally {
      setIsFetching(false)
    }
  }

  // Update data in Google Sheets
  const handleUpdateSheet = async () => {
    if (!spreadsheetId || spreadsheetId === 'YOUR_SPREADSHEET_ID_HERE') {
      toast.error('Please enter a valid Google Sheet ID')
      return
    }

    if (!updateRange || !updateValues || updateValues.length === 0) {
      toast.error('Please provide a range and values to update')
      return
    }

    try {
      setIsUpdating(true)
      // Convert updateValues array to 2D array format
      const values = [Array.isArray(updateValues) ? updateValues : [updateValues]]
      if (USE_SERVER_SHEETS) {
        const api = createGoogleSheetsService(token)
        await api.updateValues(spreadsheetId, updateRange, values, 'RAW')
        toast.success(`Successfully updated ${updateRange}`)
        await fetchSheetData()
      } else {
        // Refresh token if needed
        await refreshTokenIfNeeded()
        const response = await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId,
          range: updateRange,
          valueInputOption: 'RAW',
          resource: {
            values: values
          }
        })
        if (response.result) {
          toast.success(`Successfully updated ${updateRange}`)
          // Optionally refresh the data after update
          await fetchSheetData()
        }
      }
    } catch (error) {
      console.error('Error updating sheet:', error)
      const status = error?.status || error?.response?.status
      if (status === 404) {
        toast.error('Spreadsheet not found. Please check the Sheet ID.')
      } else if (status === 403) {
        toast.error('Access denied. Please ensure you have edit permissions.')
      } else if (!USE_SERVER_SHEETS && status === 401) {
        toast.error('Authentication expired. Please sign in again.')
        setIsSignedIn(false)
      } else {
        toast.error(`Failed to update sheet: ${error.result?.error?.message || error.message || error?.response?.data?.message || 'Unknown error'}`)
      }
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle update values input change
  const handleUpdateValuesChange = (e) => {
    const value = e.target.value
    // Parse comma-separated values
    const values = value.split(',').map(v => v.trim()).filter(v => v !== '')
    setUpdateValues(values)
  }

  return (
    <ErrorBoundary message="An error occurred while loading the Purchase Order Entry page. Please try refreshing.">
      <DashboardLayout>
        <div className="flex flex-col h-full w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-gray-100">
                Purchase Order Entry - Google Sheets
              </h1>
              <p className="text-sm text-secondary-600 dark:text-gray-400 mt-1">
                Connect to Google Sheets to view and update your PO data in real-time.
              </p>
            </div>
          </div>

          {/* Authentication Section */}
          {!isSignedIn && !USE_SERVER_SHEETS ? (
            <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-gray-100 mb-2">
                    Connect to Google Sheets
                  </h2>
                  <p className="text-sm text-secondary-600 dark:text-gray-400">
                    Sign in with your Google account to access your sheets
                  </p>
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={isLoading || !gapiLoaded}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Login with Google
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Configuration Section */}
              <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-secondary-200 dark:border-secondary-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
                    Sheet Configuration
                  </h2>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Sign Out
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                      Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      placeholder="Enter your Google Sheet ID"
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-secondary-500 dark:text-gray-400 mt-1">
                      Found in your Google Sheet URL: /spreadsheets/d/[ID]/edit
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                      Range (e.g., Sheet1!A1:Z100)
                    </label>
                    <input
                      type="text"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                      placeholder="Sheet1!A1:Z100"
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={fetchSheetData}
                  disabled={isFetching || !spreadsheetId}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Fetch Data
                    </>
                  )}
                </button>
              </div>

              {/* Update Section */}
              <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-secondary-200 dark:border-secondary-800 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
                  Update Sheet
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                      Range (e.g., Sheet1!A2:B2)
                    </label>
                    <input
                      type="text"
                      value={updateRange}
                      onChange={(e) => setUpdateRange(e.target.value)}
                      placeholder="Sheet1!A2:B2"
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                      Values (comma-separated, e.g., Somil, 5000)
                    </label>
                    <input
                      type="text"
                      value={updateValues.join(', ')}
                      onChange={handleUpdateValuesChange}
                      placeholder="Somil, 5000"
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-[#111827] text-secondary-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUpdateSheet}
                  disabled={isUpdating || !spreadsheetId}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Sheet
                    </>
                  )}
                </button>
              </div>

              {/* Data Display Section */}
              <div className="bg-white dark:bg-[#1E293B] rounded-lg border border-secondary-200 dark:border-secondary-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
                    Sheet Data
                  </h2>
                  {sheetData.length > 0 && (
                    <span className="text-sm text-secondary-600 dark:text-gray-400">
                      {sheetData.length} rows loaded
                    </span>
                  )}
                </div>

                {isFetching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-secondary-600 dark:text-gray-400">Fetching data...</span>
                  </div>
                ) : sheetData.length === 0 ? (
                  <div className="text-center py-12 text-secondary-600 dark:text-gray-400">
                    No data loaded. Click "Fetch Data" to load your sheet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-secondary-100 dark:bg-[#243045]">
                          {sheetData[0]?.map((_, colIndex) => (
                            <th
                              key={colIndex}
                              className="px-4 py-2 text-left text-sm font-semibold text-secondary-700 dark:text-gray-300 border border-secondary-300 dark:border-secondary-700"
                            >
                              {String.fromCharCode(65 + colIndex)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetData.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="hover:bg-secondary-50 dark:hover:bg-[#111827] transition-colors"
                          >
                            {row.map((cell, colIndex) => (
                              <td
                                key={colIndex}
                                className="px-4 py-2 text-sm text-secondary-900 dark:text-gray-100 border border-secondary-300 dark:border-secondary-700"
                              >
                                {cell || '\u00A0'}
                              </td>
                            ))}
                            {/* Fill empty cells if row is shorter than header */}
                            {Array.from({ length: Math.max(0, (sheetData[0]?.length || 0) - row.length) }).map((_, colIndex) => (
                              <td
                                key={`empty-${colIndex}`}
                                className="px-4 py-2 text-sm text-secondary-900 dark:text-gray-100 border border-secondary-300 dark:border-secondary-700"
                              >
                                {'\u00A0'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  )
}
