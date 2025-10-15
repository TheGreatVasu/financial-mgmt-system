import DashboardLayout from '../../components/layout/DashboardLayout.jsx'

export default function CustomerNew() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Add New Customer</h1>
        <p className="text-sm text-secondary-600 mt-1">Create a customer profile</p>
      </div>
      <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Company Name</label>
            <input className="input" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input" type="email" />
          </div>
          <div>
            <label className="block text-sm mb-1">Phone</label>
            <input className="input" />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input className="input" />
          </div>
          <div className="md:col-span-2 mt-2">
            <button className="btn btn-primary btn-md">Save</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

