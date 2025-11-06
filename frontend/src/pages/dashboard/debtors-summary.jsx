import { useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import TailAdminDashboard from '../../components/tailadmin/TailAdminDashboard.jsx'

export default function DebtorsSummaryPage() {
  useEffect(() => {
    const el = document.getElementById('debtors-summary')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  return (
    <DashboardLayout>
      <TailAdminDashboard />
    </DashboardLayout>
  )
}


