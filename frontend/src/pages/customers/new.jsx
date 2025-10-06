import AppLayout from '../../components/layout/AppLayout.jsx'

export default function CustomerNew() {
  return (
    <AppLayout title="Add New Customer">
      <div className="card p-6">
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
    </AppLayout>
  )
}

