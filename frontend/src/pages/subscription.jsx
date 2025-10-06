import AppLayout from '../components/layout/AppLayout.jsx'

export default function Subscription() {
  return (
    <AppLayout title="Subscription">
      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-secondary-500">Current Plan</div>
            <div className="text-xl font-semibold">Free</div>
          </div>
          <button className="btn btn-primary btn-md">Upgrade</button>
        </div>
        <div className="text-secondary-600 text-sm">Plan renews automatically. Placeholder UI.</div>
      </div>
    </AppLayout>
  )
}

