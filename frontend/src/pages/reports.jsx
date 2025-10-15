import DashboardLayout from '../components/layout/DashboardLayout.jsx'

export default function Reports() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-secondary-600 mt-1">Insights and analytics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm text-secondary-500">DSO</div>
          <div className="text-2xl font-semibold">0 days</div>
        </div>
        <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm text-secondary-500">Outstanding</div>
          <div className="text-2xl font-semibold">₹ 0.00</div>
        </div>
        <div className="rounded-xl border border-secondary-200/70 bg-white p-4 shadow-sm">
          <div className="text-sm text-secondary-500">Paid this month</div>
          <div className="text-2xl font-semibold">₹ 0.00</div>
        </div>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">Charts placeholder</div>
    </DashboardLayout>
  )
}

