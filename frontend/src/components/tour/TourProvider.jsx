import React from 'react'
import Joyride, { EVENTS, STATUS } from 'react-joyride'

const TourContext = React.createContext({ startTour: () => {}, resetTour: () => {} })

export function useDashboardTour() {
  const ctx = React.useContext(TourContext)
  if (!ctx) throw new Error('useDashboardTour must be used within TourProvider')
  return ctx
}

const STORAGE_KEY = 'fms_tour_completed_v1'

export default function TourProvider({ children }) {
  const [run, setRun] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(0)

  const steps = React.useMemo(() => ([
    {
      target: '[data-tour="sidebar"]',
      title: 'Navigation',
      content: 'Use the sidebar to jump between Dashboard, Reports, Invoices, Payments, Customers, and Settings.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="search"]',
      title: 'Quick Search',
      content: 'Hit ⌘K (or Ctrl+K on Windows) to focus search and find anything fast.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="create"]',
      title: 'Create Actions',
      content: 'Create a new invoice, add a customer, or record a payment from here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="kpis"]',
      title: 'Key Metrics',
      content: 'AR highlights: Outstanding balance, Overdue invoices, DSO (days), and CEI (%).',
      placement: 'bottom',
    },
    {
      target: '[data-tour="charts"]',
      title: 'Insights & Trends',
      content: 'Collections vs Invoices, Receivables Breakdown, DSO trend, and CEI gauge.',
      placement: 'top',
    },
    {
      target: '[data-tour="action-items"]',
      title: 'Action Items',
      content: 'Quick tasks surfaced from data: due today, needs attention, approvals, and more.',
      placement: 'top',
    },
    {
      target: '[data-tour="recent-invoices"]',
      title: 'Recent Invoices',
      content: 'Latest activity across customers. Filter by status to focus your workflow.',
      placement: 'top',
    },
    {
      target: '[data-tour="alerts-card"]',
      title: 'Alerts',
      content: 'System signals for overdue, broken promises, and successful payments.',
      placement: 'left',
    },
    {
      target: '[data-tour="top-customers"]',
      title: 'Top Customers',
      content: 'Largest outstanding balances to prioritize collections impact.',
      placement: 'left',
    },
    {
      target: '[data-tour="notifications"]',
      title: 'Notifications',
      content: 'Stay on top of due invoices and payment events. Alerts also appear here.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="profile"]',
      title: 'Profile & Account',
      content: 'Manage your profile, preferences, and sign out.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="topbar"]',
      title: 'Filters & Utilities',
      content: 'Global actions like filters, date ranges, and exports are available here.',
      placement: 'bottom',
    },
  ]), [])

  const startTour = React.useCallback(() => {
    // Always allow manual start even if user completed earlier
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setStepIndex(0)
    // restart sequence to ensure Joyride re-runs if it previously finished
    setRun(false)
    setTimeout(() => setRun(true), 0)
  }, [])

  const resetTour = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setStepIndex(0)
  }, [])

  const handleJoyride = React.useCallback((data) => {
    const { type, index, status } = data
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + 1)
    }
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false)
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }, [])

  const tourCompleted = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true'

  return (
    <TourContext.Provider value={{ startTour, resetTour }}>
      {children}
      <Joyride
        run={run}
        steps={steps}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        showProgress
        scrollToFirstStep
        disableScrolling={false}
        hideCloseButton
        callback={handleJoyride}
        styles={{
          options: {
            primaryColor: '#2563eb',
            zIndex: 10000,
            arrowColor: '#111827',
            textColor: '#111827',
            backgroundColor: 'white',
          },
          tooltip: {
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(2,6,23,0.18)',
            padding: 16,
          },
          tooltipTitle: { fontSize: 16, fontWeight: 700 },
          tooltipContent: { fontSize: 14, lineHeight: 1.5 },
          buttonNext: {
            backgroundColor: '#2563eb',
            borderRadius: 8,
            padding: '8px 12px',
          },
          buttonBack: {
            color: '#374151',
            marginRight: 8,
          },
          buttonSkip: {
            color: '#6b7280',
          },
          spotlight: {
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 4px rgba(59,130,246,0.5)',
            borderRadius: 12,
            transition: 'all 300ms ease',
          },
        }}
      />
    </TourContext.Provider>
  )
}


