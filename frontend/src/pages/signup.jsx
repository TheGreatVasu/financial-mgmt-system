import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { register } from '../services/authService'

export default function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('business_user')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [touched, setTouched] = useState({})

  // Check for success message from location state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage)
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location])

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

  const validateEmail = (value) => {
    if (!value.trim()) {
      return 'Email is required'
    }
    // Accept only company domain or gmail.com
    const emailRegex = /@([a-zA-Z0-9-]+\.)?(financialmgmt\.com|gmail\.com)$/
    if (!emailRegex.test(value)) {
      return 'Email must be a valid @financialmgmt.com or @gmail.com address'
    }
    return ''
  }

  const validatePhoneNumber = (value) => {
    if (!value || !value.trim()) {
      return 'Phone number is required'
    }
    // Allow only digits, optional + at start, 7-15 digits
    if (!/^\+?\d{7,15}$/.test(value)) {
      return 'Phone number must contain only digits and be 7-15 digits long'
    }
    return ''
  }

  const validatePassword = (value) => {
    if (!value) {
      return 'Password is required'
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number'
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return 'Password must contain at least one special symbol (@$!%*?&)'
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
      case 'email':
        setEmail(value)
        break
      case 'phoneNumber':
        // Only allow digits for phone number
        const digitsOnly = value.replace(/\D/g, '')
        setPhoneNumber(digitsOnly)
        break
      case 'password':
        setPassword(value)
        break
    }

    // Validate on change if field has been touched
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
    errors.email = validateEmail(email)
    errors.phoneNumber = validatePhoneNumber(phoneNumber)
    errors.role = validateRole(role)
    errors.password = validatePassword(password)

    setFieldErrors(errors)
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      role: true,
      password: true
    })
    return !Object.values(errors).some(error => error !== '')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    // Clear previous field errors
    setFieldErrors({})

    if (!validateAllFields()) {
      setError('Please fix the errors below before submitting')
      return
    }

    setLoading(true)
    try {
      // Validate phone number before combining
      if (!phoneNumber || phoneNumber.trim().length < 7) {
        setError('Phone number must be at least 7 digits')
        setFieldErrors(prev => ({ ...prev, phoneNumber: 'Phone number must be at least 7 digits' }))
        setTouched(prev => ({ ...prev, phoneNumber: true }))
        setLoading(false)
        return
      }
      
      // Combine country code and phone number (ensure country code starts with +)
      const formattedCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`
      const fullPhoneNumber = `${formattedCountryCode}${phoneNumber.trim()}`
      
      const result = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: fullPhoneNumber,
        role: role,
        password
      })

      if (result.success) {
        setSuccessMessage('Account created successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              successMessage: 'Account created successfully! Please log in.',
              email: email.trim().toLowerCase()
            } 
          })
        }, 1500)
      }
    } catch (err) {
      // Handle validation errors from backend
      const errorResponse = err?.response?.data
      
      if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
        // Map backend field errors to frontend field errors
        const fieldErrorsMap = {}
        errorResponse.errors.forEach(error => {
          if (error.field) {
            // Map backend field names to frontend field names
            let frontendField = error.field
            if (error.field === 'phoneNumber') {
              frontendField = 'phoneNumber'
            }
            fieldErrorsMap[frontendField] = error.message
          }
        })
        
        // Update field errors
        if (Object.keys(fieldErrorsMap).length > 0) {
          setFieldErrors(prev => ({ ...prev, ...fieldErrorsMap }))
          setTouched(prev => {
            const newTouched = { ...prev }
            Object.keys(fieldErrorsMap).forEach(field => {
              newTouched[field] = true
            })
            return newTouched
          })
        }
        
        // Set main error message
        setError(errorResponse?.message || 'Please fix the errors below')
      } else {
        // Generic error
        setError(err?.message || errorResponse?.message || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Single Centered Box */}
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
              
              {/* Financial Chart Pattern Overlay */}
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

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-primary-900/50 to-indigo-900/60" />
              
              {/* Content */}
              <div className="relative z-10 space-y-8">
                {/* Logo */}
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
                
                {/* Short Catchy Heading */}
                <div>
                  <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
                    Manage Finances Smarter
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto lg:mx-0">
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                  <p className="text-sm text-gray-600">Sign up to get started with your financial workspace</p>
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
                  {/* First Name and Last Name - Two Column Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                        fieldErrors.email 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      placeholder="you@company.com"
                      type="email"
                      value={email}
                      onChange={(e) => handleFieldChange('email', e.target.value, validateEmail)}
                      onBlur={() => handleBlur('email', email, validateEmail)}
                      required
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
                      {/* Country Code Selector */}
                      <div>
                        <select
                          className={`w-full px-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm ${
                            fieldErrors.phoneNumber 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          required
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+1">🇨🇦 +1</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+82">🇰🇷 +82</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+52">🇲🇽 +52</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+31">🇳🇱 +31</option>
                          <option value="+46">🇸🇪 +46</option>
                          <option value="+47">🇳🇴 +47</option>
                          <option value="+45">🇩🇰 +45</option>
                          <option value="+41">🇨🇭 +41</option>
                          <option value="+32">🇧🇪 +32</option>
                          <option value="+351">🇵🇹 +351</option>
                          <option value="+353">🇮🇪 +353</option>
                          <option value="+358">🇫🇮 +358</option>
                          <option value="+48">🇵🇱 +48</option>
                          <option value="+7">🇷🇺 +7</option>
                          <option value="+90">🇹🇷 +90</option>
                          <option value="+20">🇪🇬 +20</option>
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+254">🇰🇪 +254</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+94">🇱🇰 +94</option>
                          <option value="+977">🇳🇵 +977</option>
                          <option value="+95">🇲🇲 +95</option>
                          <option value="+84">🇻🇳 +84</option>
                          <option value="+66">🇹🇭 +66</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+62">🇮🇩 +62</option>
                          <option value="+63">🇵🇭 +63</option>
                          <option value="+64">🇳🇿 +64</option>
                        </select>
                      </div>
                      
                      {/* Phone Number Input */}
                      <div>
                        <input
                          className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                            fieldErrors.phoneNumber 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          placeholder="1234567890"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => handleFieldChange('phoneNumber', e.target.value, validatePhoneNumber)}
                          onBlur={() => handleBlur('phoneNumber', phoneNumber, validatePhoneNumber)}
                          required
                        />
                      </div>
                    </div>
                    {fieldErrors.phoneNumber && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5">Select your country code and enter your phone number</p>
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

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-3 pr-12 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${
                          fieldErrors.password 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handleFieldChange('password', e.target.value, validatePassword)}
                        onBlur={() => handleBlur('password', password, validatePassword)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {fieldErrors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1.5">
                      Must be at least 8 characters with uppercase, lowercase, number, and special symbol
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl text-white text-base font-semibold bg-gradient-to-r from-primary-600 via-primary-600 to-indigo-600 hover:from-primary-700 hover:via-primary-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors" to="/login">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
