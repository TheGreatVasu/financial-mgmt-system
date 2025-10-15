import DashboardLayout from '../components/layout/DashboardLayout.jsx'

export default function Subscription() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="text-sm text-secondary-600 mt-1">Manage your plan and billing</p>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-6 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-secondary-500">Current Plan</div>
            <div className="text-xl font-semibold">Free</div>
          </div>
          <button className="btn btn-primary btn-md">Upgrade</button>
        </div>
        <div className="text-secondary-600 text-sm">Plan renews automatically. Placeholder UI.</div>
      </div>
    </DashboardLayout>
  )
}

