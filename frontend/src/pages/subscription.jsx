import { useEffect, useMemo, useState } from 'react'
import { Check, X, CreditCard, Loader2, AlertCircle, CheckCircle2, Wifi, WifiOff } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { cancelSubscription, changePlan, resumeSubscription, updatePaymentMethod } from '../services/apiService'
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription'
import Modal from '../components/ui/Modal.jsx'

// Modern Compact Pricing Card Component
function PricingCard({ plan, current, onSelect, loading }) {
  const isCurrent = current?.id === plan.id
  const isPremium = plan.id === 'premium'
  const isFree = plan.id === 'free' || plan.id === 'basic'
  const isClassic = plan.id === 'classic'
  
  return (
    <div 
      className={`relative rounded-xl border transition-all duration-300 transform hover:scale-[1.01] hover:shadow-xl flex flex-col h-full ${
        plan.popular 
          ? 'border-blue-400 bg-gradient-to-br from-blue-50/50 to-white shadow-md ring-2 ring-blue-100' 
          : isPremium
          ? 'border-purple-200 bg-white shadow-md hover:border-purple-300'
          : 'border-gray-200 bg-white shadow-md hover:border-gray-300'
      } ${isCurrent ? 'ring-2 ring-green-400 border-green-400' : ''}`}
      role="article"
      aria-label={`${plan.name} pricing plan`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="p-5 flex flex-col h-full">
        {/* Plan Header */}
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">{plan.name}</h3>
          
          {/* Plan Description */}
          <p className="text-xs text-gray-600 leading-snug mb-2 px-1">
            {plan.description}
          </p>
          
          {/* Additional Note */}
          {plan.note && (
            <p className="text-xs text-gray-500 italic leading-snug px-1 mb-2">
              {plan.note}
            </p>
          )}
        </div>
        
        {/* Features List - Compact */}
        <ul className="space-y-1.5 mb-4 flex-grow" role="list">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <Check className="w-3.5 h-3.5 text-green-500 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs text-gray-700 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* CTA Button - Always at bottom */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          {isCurrent ? (
            <button 
              className="btn btn-outline btn-sm w-full opacity-60 cursor-not-allowed"
              disabled
              aria-label="Current plan"
            >
              Current Plan
            </button>
          ) : isPremium ? (
            <button
              onClick={() => window.location.href = '/contact'}
              className="btn btn-primary btn-sm w-full"
              aria-label="Contact sales for Premium plan"
            >
              Click Here to Proceed
            </button>
          ) : isClassic ? (
            <button
              onClick={() => onSelect(plan.id)}
              disabled={loading}
              className="btn btn-primary btn-sm w-full"
              aria-label="Proceed with Classic plan"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                'Click Here to Proceed'
              )}
            </button>
          ) : (
            <button
              onClick={() => onSelect(plan.id)}
              disabled={loading}
              className="btn btn-primary btn-sm w-full"
              aria-label="Proceed with Free plan"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                'Click Here to Proceed'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Payment Modal Component - Placeholder (Payment integration will be added later)
function PaymentModal({ open, onClose, plan, onSuccess, token }) {
  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="p-6">
        <div className="text-center py-8">
          <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Integration Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Payment processing will be integrated soon. For now, plan changes are processed directly.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function Subscription() {
  const { token, user } = useAuthContext()
  const [saving, setSaving] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // Use real-time subscription hook for live data updates
  const { 
    data: subscriptionData, 
    loading, 
    error, 
    isLive, 
    connectionStatus,
    refresh 
  } = useRealtimeSubscription(token)
  
  const data = subscriptionData || { subscription: null, catalog: [] }
  const sub = data.subscription

  // Enhanced catalog with updated plan details based on current subscription
  const enhancedCatalog = useMemo(() => {
    const baseCatalog = data.catalog || []
    return baseCatalog.map(plan => {
      // Classic Plan - Check this FIRST (basic with price > 0 should be Classic)
      if (plan.id === 'classic' || (plan.id === 'basic' && plan.price > 0)) {
        return {
          ...plan,
          id: 'classic',
          name: 'Classic',
          price: plan.price || 999,
          popular: true,
          description: 'Best for business individuals and smaller companies — lifetime access with 50 GB storage.',
          note: 'If usage exceeds 50 GB, additional data charges will apply automatically.',
          features: [
            '50 GB storage',
            'Advanced dashboards',
            'Priority support',
            'PDF export',
            'Analytics access'
          ]
        }
      } 
      // Free Plan - Only match 'free' id, not 'basic'
      else if (plan.id === 'free') {
        return {
          ...plan,
          id: 'free',
          name: 'Free',
          price: 0,
          description: 'Free for 3 months — includes 15 GB of storage.',
          note: 'If you need more storage, click on the Custom plan according to your requirements.',
          features: [
            '15 GB free storage',
            'Basic dashboards',
            'Email support',
            'Up to 50 invoices/month',
            'PDF export',
            'Mobile app access'
          ]
        }
      } 
      // Premium Plan
      else if (plan.id === 'premium') {
        return {
          ...plan,
          name: 'Premium',
          price: null, // Custom pricing
          description: 'Ideal for mid-level and large companies — includes unlimited storage and tailored solutions.',
          note: 'Fully customizable according to company requirements and data usage.',
          features: [
            'Custom storage',
            'Dedicated account manager',
            '24/7 support',
            'White-label options',
            'Advanced analytics'
          ]
        }
      }
      // Fallback for any other plans (including 'basic' with price 0)
      return {
        ...plan,
        id: plan.id === 'basic' ? 'free' : plan.id,
        name: plan.id === 'basic' ? 'Free' : plan.name,
        price: plan.id === 'basic' ? 0 : plan.price,
        description: plan.id === 'basic' ? 'Free for 3 months — includes 15 GB of storage.' : plan.description,
        note: plan.id === 'basic' ? 'If you need more storage, click on the Custom plan according to your requirements.' : plan.note,
        features: plan.id === 'basic' ? [
          '15 GB free storage',
          'Basic dashboards',
          'Email support',
          'Up to 50 invoices/month',
          'PDF export',
          'Mobile app access'
        ] : plan.features
      }
    })
  }, [data.catalog])

  // Calculate storage limits based on current plan (real-time)
  const storageLimit = useMemo(() => {
    if (!sub?.currentPlan) return 15 // Default to Free plan limit
    
    const planId = sub.currentPlan.id
    const planName = (sub.currentPlan?.name || '').toLowerCase()
    
    // Determine plan-based limit
    let planBasedLimit = 15 // Default to Free plan
    
    if (planId === 'free' || planId === 'basic' || planName === 'free') {
      planBasedLimit = 15 // Free plan: 15 GB free for 3 months
    } else if (planId === 'classic' || planName === 'classic') {
      planBasedLimit = 50 // Classic plan: 50 GB storage included
    } else if (planId === 'premium' || planName === 'premium') {
      planBasedLimit = 999999 // Premium plan: Custom (very high number for display)
    }
    
    // Use backend limit if it exists and is reasonable, otherwise use plan-based limit
    if (sub.usage?.storageLimitGb && sub.usage.storageLimitGb > 0) {
      // If backend limit matches a known plan limit or is close, use it
      // Otherwise, prefer plan-based limit for consistency
      const backendLimit = sub.usage.storageLimitGb
      if (backendLimit === 15 || backendLimit === 50 || backendLimit >= 999999) {
        return backendLimit
      }
      // If backend limit doesn't match expected values, use plan-based limit
      return planBasedLimit
    }
    
    return planBasedLimit
  }, [sub])

  // Get current storage usage (default to 0 for trial/new users)
  const currentStorage = useMemo(() => {
    return sub?.usage?.storageGb || 0
  }, [sub])

  const usagePct = useMemo(() => {
    const used = currentStorage || 0
    const limit = storageLimit || 0
    if (limit === 0) return 0
    return limit >= 999999 ? 0 : Math.min(100, Math.round((used / limit) * 100))
  }, [currentStorage, storageLimit])

  async function onPickPlan(planId) {
    const plan = enhancedCatalog.find(p => p.id === planId)
    
    // Premium plan - redirect to contact form
    if (planId === 'premium') {
      window.location.href = '/contact'
      return
    }
    
    // Free plan - activate trial directly (no payment needed)
    if (planId === 'free' || plan?.price === 0) {
      setSaving(true)
      try {
        // Use 'free' or 'basic' id depending on backend compatibility
        const backendPlanId = planId === 'free' ? 'free' : 'basic'
        const res = await changePlan(token, backendPlanId)
        // Refresh real-time data after plan change
        await refresh()
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      } catch (err) {
        console.error('Failed to change plan:', err)
      } finally {
        setSaving(false)
      }
      return
    }
    
    // Classic plan (paid) - activate directly for now (payment will be added later)
    if (planId === 'classic') {
      setSaving(true)
      try {
        // Use 'classic' or 'basic' id depending on backend compatibility
        const backendPlanId = planId === 'classic' ? 'classic' : 'basic'
        const res = await changePlan(token, backendPlanId)
        // Refresh real-time data after plan change
        await refresh()
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
      } catch (err) {
        console.error('Failed to change plan:', err)
      } finally {
        setSaving(false)
      }
      return
    }
    
    // Fallback for other paid plans - activate directly
    setSaving(true)
    try {
      const res = await changePlan(token, planId)
      await refresh()
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 5000)
    } catch (err) {
      console.error('Failed to change plan:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handlePaymentSuccess(response) {
    // Refresh real-time data after payment
    await refresh()
    setShowPaymentModal(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 5000)
  }

  async function onCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.')) return
    setSaving(true)
    try {
      await cancelSubscription(token)
      // Refresh real-time data after cancellation
      await refresh()
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
    } finally {
    setSaving(false)
    }
  }

  async function onResume() {
    setSaving(true)
    try {
      await resumeSubscription(token)
      // Refresh real-time data after resuming
      await refresh()
    } catch (err) {
      console.error('Failed to resume subscription:', err)
    } finally {
    setSaving(false)
    }
  }

  async function onUpdatePm() {
    // Payment method update will be added later
    alert('Payment method update will be available soon. This feature is coming in a future update.')
  }

  return (
    <DashboardLayout>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Subscription updated successfully!</span>
          </div>
        </div>
      )}

      {/* Real-time Connection Status Indicator */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-md ${
          isLive 
            ? 'bg-green-50 border border-green-200' 
            : connectionStatus === 'polling'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          {isLive ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Live</span>
            </>
          ) : connectionStatus === 'polling' ? (
            <>
              <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
              <span className="text-xs font-medium text-yellow-800">Syncing...</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-800">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">{error}</span>
            <button
              onClick={refresh}
              className="ml-auto text-sm text-red-600 hover:text-red-800 font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Subscription</h1>
          <p className="text-sm text-secondary-600 mt-1">Manage your subscription plan and billing</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          Flexible Pricing Plans Built for Growth
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Simple, scalable, and transparent pricing for every business.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading subscription plans...</span>
        </div>
      ) : (
        <>
          {/* Pricing Cards - Compact Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
              {enhancedCatalog.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  current={sub?.currentPlan}
                  onSelect={onPickPlan}
                  loading={saving}
                />
              ))}
            </div>
          </div>

          {/* Current Plan Section - Dynamic & Real-time */}
          {sub && (
            <div className="mb-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-lg transition-all duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Plan</h2>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                  <div className="transition-all duration-300">
                    <div className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">Active Subscription</div>
                    <div className="text-3xl font-bold text-gray-900 mb-2 transition-all duration-300">
                      {(() => {
                        const planName = sub.currentPlan?.name || 'Free'
                        // Normalize plan names to match our design
                        if (planName.toLowerCase() === 'basic' && sub.currentPlan?.price === 0) {
                          return 'Free'
                        }
                        if (planName.toLowerCase() === 'basic' && sub.currentPlan?.price > 0) {
                          return 'Classic'
                        }
                        return planName
                      })()}
                    </div>
                    {sub.billing?.renewsAt && (
                      <div className="text-sm text-gray-600 transition-all duration-300">
                        Renews on <span className="font-semibold">{new Date(sub.billing.renewsAt).toLocaleDateString('en-IN', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    )}
                    {!sub.billing?.renewsAt && sub.currentPlan?.price === 0 && (
                      <div className="text-sm text-gray-600 transition-all duration-300">
                        Trial period active
                      </div>
                    )}
                  </div>
                  <div className="text-right transition-all duration-300">
                    <div className="text-3xl font-bold text-gray-900">
                      {sub.currentPlan?.price === 0 || !sub.currentPlan?.price ? 'Free' : `₹${sub.currentPlan?.price?.toLocaleString('en-IN')}`}
                    </div>
                    {sub.currentPlan?.price > 0 && (
                      <div className="text-sm text-gray-500">
                        per {sub.currentPlan?.interval || 'month'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Statistics - Dynamic Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Storage Card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-md">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Storage</div>
                  <div className="text-xl font-bold text-gray-900 mb-1 transition-all duration-300">
                    {currentStorage.toFixed(1)} / {storageLimit >= 999999 ? 'Unlimited' : `${storageLimit || '0'}`} {storageLimit < 999999 ? 'GB' : ''}
                  </div>
                  <div className="text-xs text-gray-500 transition-all duration-300">
                    {storageLimit > 0 && storageLimit < 999999 ? `${usagePct}% used` : 'Trial period'}
                  </div>
                </div>

                {/* Invoices Card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-md">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Invoices</div>
                  <div className="text-xl font-bold text-gray-900 mb-1 transition-all duration-300">
                    {sub.usage?.invoicesThisMonth || 0}
                  </div>
                  <div className="text-xs text-gray-500 transition-all duration-300">
                    Limit: {(() => {
                      const planId = sub.currentPlan?.id
                      const planName = (sub.currentPlan?.name || '').toLowerCase()
                      if (planId === 'free' || planId === 'basic' || planName === 'free') {
                        return sub.usage?.invoiceLimit || '50'
                      } else if (planId === 'classic' || planName === 'classic') {
                        return sub.usage?.invoiceLimit || 'Unlimited'
                      } else if (planId === 'premium' || planName === 'premium') {
                        return 'Unlimited'
                      }
                      return sub.usage?.invoiceLimit || '50'
                    })()}
                  </div>
                </div>

                {/* Billing Status Card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-md">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Billing Status</div>
                  <div className={`text-xl font-bold capitalize transition-all duration-300 ${
                    sub.billing?.status === 'active' ? 'text-green-600' :
                    sub.billing?.status === 'pending' ? 'text-yellow-600' :
                    sub.billing?.status === 'expired' || sub.billing?.status === 'cancelled' ? 'text-red-600' :
                    'text-gray-900'
                  }`}>
                    {sub.billing?.status?.replace(/_/g, ' ') || 'Active'}
                  </div>
                </div>

                {/* Account Card */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-md">
                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Account</div>
                  <div className="text-xl font-bold text-gray-900 transition-all duration-300">
                    {user?.firstName || ''} {user?.lastName || ''}
                    {!user?.firstName && !user?.lastName && 'User'}
                  </div>
                </div>
              </div>

              {/* Storage Usage Bar - Animated Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-semibold text-gray-900">Storage Usage</span>
                  <span className="font-semibold text-gray-700 transition-all duration-300">
                    {sub.usage?.storageGb?.toFixed(1) || currentStorage.toFixed(1)} / {storageLimit >= 999999 ? 'Unlimited' : `${storageLimit || '0'}`} {storageLimit < 999999 ? 'GB' : ''} used — {usagePct}%
                  </span>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      usagePct >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      usagePct >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ 
                      width: `${usagePct}%`,
                      transition: 'width 0.7s ease-out, background-color 0.3s ease-out'
                    }}
                  />
                </div>
                {usagePct >= 90 && (
                  <p className="text-xs text-red-600 mt-2 font-medium animate-pulse">
                    ⚠️ Storage limit nearly reached. Consider upgrading your plan.
                  </p>
                )}
                {usagePct >= 70 && usagePct < 90 && (
                  <p className="text-xs text-yellow-600 mt-2 font-medium">
                    ⚡ Storage usage is getting high. Monitor your usage.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                {sub.billing?.status === 'active' || !sub.billing?.status ? (
                  <button 
                    className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onCancel} 
                    disabled={saving}
                    aria-label="Cancel subscription at period end"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Cancel at Period End'
                    )}
                  </button>
                ) : (
                  <button 
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onResume} 
                    disabled={saving}
                    aria-label="Resume subscription"
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Resume Subscription'
                    )}
                  </button>
                )}
                <button 
                  className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onUpdatePm} 
                  disabled={saving}
                  aria-label="Update payment method"
                >
                  {saving ? (
                    <span className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Update Payment Method'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Feature Comparison Table */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Compare All Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See exactly what's included in each plan and choose the one that fits your needs
              </p>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-2xl border-2 border-gray-200 shadow-xl">
              <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Feature comparison table">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Classic</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 uppercase tracking-wide">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {[
                    { feature: 'Storage', basic: '15 GB', classic: '50 GB', premium: 'Unlimited' },
                    { feature: 'Invoices per month', basic: '50', classic: 'Unlimited', premium: 'Unlimited' },
                    { feature: 'Email Support', basic: '✓', classic: 'Priority', premium: '24/7' },
                    { feature: 'PDF Export', basic: '✓', classic: '✓', premium: '✓' },
                    { feature: 'Excel Export', basic: '✗', classic: '✓', premium: '✓' },
                    { feature: 'Mobile App Access', basic: '✓', classic: '✓', premium: '✓' },
                    { feature: 'Analytics Dashboard', basic: 'Basic', classic: 'Advanced', premium: 'Advanced + AI' },
                    { feature: 'Phone Support', basic: '✗', classic: '✗', premium: '✓' },
                    { feature: 'API Access', basic: '✗', classic: '✓', premium: 'Advanced' },
                    { feature: 'Custom Integrations', basic: '✗', classic: '✗', premium: '✓' },
                    { feature: 'SSO/SAML', basic: '✗', classic: '✗', premium: '✓' },
                    { feature: 'Dedicated Account Manager', basic: '✗', classic: '✗', premium: '✓' },
                    { feature: 'SLA Guarantee', basic: '✗', classic: '✗', premium: '✓' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {row.basic === '✓' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.basic === '✗' ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="font-medium">{row.basic}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {row.classic === '✓' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.classic === '✗' ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="font-medium">{row.classic}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">
                        {row.premium === '✓' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : row.premium === '✗' ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="font-medium">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
              <p className="text-gray-600">Everything you need to know about our pricing and plans</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: 'Can I try the service for free?',
                  a: 'Yes! The Free plan offers a free 3-month trial for eligible companies with 15 GB of free data. No credit card required to start.'
                },
                {
                  q: 'What happens after my free trial ends?',
                  a: 'After your free trial, you can choose to upgrade to Classic or Premium plan, or continue with limited Free features. We\'ll notify you before your trial ends.'
                },
                {
                  q: 'Can I switch plans anytime?',
                  a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing differences.'
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, UPI, and bank transfers. Enterprise customers can also pay via invoice.'
                },
                {
                  q: 'Is my data secure?',
                  a: 'Absolutely. We use bank-grade security with end-to-end encryption, regular backups, and comply with industry security standards including GDPR and SOC 2.'
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us within 30 days for a full refund.'
                },
                {
                  q: 'What support do you provide?',
                  a: 'Free includes email support, Classic includes priority email support, and Premium includes 24/7 phone support with a dedicated account manager.'
                },
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your billing period, and you\'ll continue to have access to all features until then.'
                }
              ].map((faq, idx) => (
                <details key={idx} className="group">
                  <summary className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="font-semibold text-gray-900">{faq.q}</span>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="p-4 pt-0 text-gray-600">{faq.a}</div>
                </details>
              ))}
            </div>
        </div>

          {/* Payment Modal */}
          {selectedPlan && (
            <PaymentModal
              open={showPaymentModal}
              onClose={() => {
                setShowPaymentModal(false)
                setSelectedPlan(null)
              }}
              plan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              token={token}
            />
          )}
        </>
      )}
    </DashboardLayout>
  )
}
