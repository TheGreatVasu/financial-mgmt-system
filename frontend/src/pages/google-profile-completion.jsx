import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import { completeGoogleProfile } from '../services/authService'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function GoogleProfileCompletionPage() {
  const { token, refresh } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('business_user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Get user data from location state (passed from Google login)
  useEffect(() => {
    if (location.state?.user) {
      const user = location.state.user
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
    }
    
    // If no token, redirect to login
    if (!token) {
      navigate('/login')
    }
  }, [location, token, navigate])

  // Validation functions
  const validateFirstName = (value) => {
    if (!value.trim()) {
      return 'First name is required'
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return 'First name can only contain letters and spaces'
    }
    if (value.trim().length < 2) {
      return 'First name must be at least 2 characters'
    }
    return ''
  }

  const validateLastName = (value) => {
    if (!value.trim()) {
      return 'Last name is required'
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return 'Last name can only contain letters and spaces'
    }
    if (value.trim().length < 2) {
      return 'Last name must be at least 2 characters'
    }
    return ''
  }

  const validatePhoneNumber = (value) => {
    if (!value || !value.trim()) {
      return 'Phone number is required'
    }
    const digitsOnly = value.replace(/\D/g, '')
    if (digitsOnly.length < 7) {
      return 'Phone number is too short'
    }
    if (digitsOnly.length > 15) {
      return 'Phone number is too long'
    }
    return ''
  }

  const validateRole = (value) => {
    const validRoles = ['business_user', 'company_admin', 'system_admin']
    if (!value || !validRoles.includes(value)) {
      return 'Please select a valid role'
    }
    return ''
  }

  const handleFieldChange = (field, value, validator) => {
    switch (field) {
      case 'firstName':
        setFirstName(value)
        break
      case 'lastName':
        setLastName(value)
        break
      case 'phoneNumber':
        const digitsOnly = value.replace(/\D/g, '')
        setPhoneNumber(digitsOnly)
        break
    }

    if (touched[field]) {
      const error = validator(value)
      setFieldErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleBlur = (field, value, validator) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validator(value)
    setFieldErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateAllFields = () => {
    const errors = {}
    errors.firstName = validateFirstName(firstName)
    errors.lastName = validateLastName(lastName)
    errors.phoneNumber = validatePhoneNumber(phoneNumber)
    errors.role = validateRole(role)

    setFieldErrors(errors)
    setTouched({
      firstName: true,
      lastName: true,
      phoneNumber: true,
      role: true
    })
    return !Object.values(errors).some(error => error !== '')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setFieldErrors({})

    if (!validateAllFields()) {
      setError('Please fix the errors below before submitting')
      return
    }

    if (!token) {
      setError('Session expired. Please log in again.')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      if (!phoneNumber || phoneNumber.trim().length < 7) {
        setError('Phone number must be at least 7 digits')
        setFieldErrors(prev => ({ ...prev, phoneNumber: 'Phone number must be at least 7 digits' }))
        setTouched(prev => ({ ...prev, phoneNumber: true }))
        setLoading(false)
        return
      }
      
      const formattedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`
      const fullPhoneNumber = `${formattedCountryCode}${phoneNumber.trim()}`
      
      const updatedUser = await completeGoogleProfile(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: fullPhoneNumber,
        role
      })

      // Force refresh user data from server (bypassing cache)
      // This ensures we have the latest user data with updated profile
      await refresh(true)

      // Small delay to ensure state is updated before navigation
      await new Promise(resolve => setTimeout(resolve, 100))

      setSuccessMessage('Profile completed successfully! Logging you in...')
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1500)
    } catch (err) {
      let errorMsg = err?.message || 'Failed to complete profile'
      
      // Handle role column truncation error with helpful message
      if (errorMsg.includes('Role column') || err?.response?.data?.error === 'ROLE_COLUMN_TRUNCATION') {
        if (err?.response?.data?.retry) {
          errorMsg = 'Database schema was updated. Please refresh this page and try again.'
        } else {
          errorMsg = 'Database schema needs to be updated. The system will attempt to fix this automatically. Please try again in a moment, or contact your administrator if the issue persists.'
        }
      }
      
      setError(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left Side - Minimal with Background */}
            <div className="relative p-8 lg:p-12 flex flex-col justify-center min-h-[400px] lg:min-h-auto overflow-hidden">
              {/* Professional Financial Background Pattern */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%),
                    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 10px,
                      rgba(59, 130, 246, 0.03) 10px,
                      rgba(59, 130, 246, 0.03) 20px
                    )
                  `,
                  backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px'
                }}
              />
              
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%),
                    linear-gradient(0deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)
                  `,
                  backgroundSize: '200px 200px, 200px 200px',
                  backgroundPosition: '0 0, 100px 100px'
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-primary-900/50 to-indigo-900/60" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">S</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Startup Project
                    </h1>
                    <p className="text-sm text-white/80">Financial Management System</p>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                    Complete Your Profile
                  </h2>
                  <p className="text-white/80 mt-4">Just a few more details to get started</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
                  <p className="text-sm text-gray-600">Please complete your profile to continue</p>
                </div>

                {/* Messages */}
                {successMessage && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input 
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        fieldErrors.firstName 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="John" 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => handleFieldChange('firstName', e.target.value, validateFirstName)} 
                      onBlur={() => handleBlur('firstName', firstName, validateFirstName)}
                      required 
                    />
                    {fieldErrors.firstName && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input 
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        fieldErrors.lastName 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="Doe" 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => handleFieldChange('lastName', e.target.value, validateLastName)} 
                      onBlur={() => handleBlur('lastName', lastName, validateLastName)}
                      required 
                    />
                    {fieldErrors.lastName && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="px-3 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+91">+91 (IN)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+49">+49 (DE)</option>
                        <option value="+33">+33 (FR)</option>
                        <option value="+81">+81 (JP)</option>
                        <option value="+86">+86 (CN)</option>
                      </select>
                      <input 
                        className={`flex-1 px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          fieldErrors.phoneNumber 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        placeholder="1234567890" 
                        type="text" 
                        value={phoneNumber} 
                        onChange={(e) => handleFieldChange('phoneNumber', e.target.value, validatePhoneNumber)} 
                        onBlur={() => handleBlur('phoneNumber', phoneNumber, validatePhoneNumber)}
                        required 
                      />
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        fieldErrors.role 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value)
                        if (touched.role) {
                          const error = validateRole(e.target.value)
                          setFieldErrors(prev => ({ ...prev, role: error }))
                        }
                      }}
                      onBlur={() => handleBlur('role', role, validateRole)}
                      required
                    >
                      <option value="business_user">Business User - Manage daily financial operations</option>
                      <option value="company_admin">Company Admin - Oversee users and reports within your organization</option>
                      <option value="system_admin">System Admin - Manage the entire system (Software owners/developers)</option>
                    </select>
                    {fieldErrors.role && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.role}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5">Select the role that best describes your responsibilities</p>
                  </div>

                  <button 
                    className="w-full h-12 rounded-xl text-white text-base font-semibold bg-gradient-to-r from-primary-600 via-primary-600 to-indigo-600 hover:from-primary-700 hover:via-primary-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]" 
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Completing...
                      </span>
                    ) : (
                      'Complete Profile & Login'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

