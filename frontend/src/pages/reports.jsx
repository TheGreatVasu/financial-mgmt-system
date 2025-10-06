import AppLayout from '../components/layout/AppLayout.jsx'

export default function Reports() {
  return (
    <AppLayout title="Reports">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-secondary-500">DSO</div>
          <div className="text-2xl font-semibold">0 days</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-secondary-500">Outstanding</div>
          <div className="text-2xl font-semibold">₹ 0.00</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-secondary-500">Paid this month</div>
          <div className="text-2xl font-semibold">₹ 0.00</div>
        </div>
      </div>
      <div className="card p-6">Charts placeholder</div>
    </AppLayout>
  )
}

