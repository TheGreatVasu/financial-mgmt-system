import { useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import TailAdminDashboard from '../../components/tailadmin/TailAdminDashboard.jsx'

export default function MonthlyPlanPage() {
  useEffect(() => {
    const el = document.getElementById('monthly-plan')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  return (
    <DashboardLayout>
      <TailAdminDashboard />
    </DashboardLayout>
  )
}


