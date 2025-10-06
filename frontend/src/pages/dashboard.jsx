import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import LineChart from '../components/ui/LineChart.jsx'

export default function Dashboard() {
  const { user } = useAuthContext()

  const stats = [
    { label: 'Total Revenue', value: '₹ 12,40,000' },
    { label: 'Payments Received', value: '₹ 9,10,000' },
    { label: 'Outstanding', value: '₹ 3,30,000' },
  ]

  const payments = [
    { customer: 'Acme Corp', invoice: 'INV-1001', amount: '₹ 45,000', due: '2025-10-15', status: 'Paid' },
    { customer: 'Globex', invoice: 'INV-1002', amount: '₹ 90,000', due: '2025-10-20', status: 'Overdue' },
    { customer: 'Initech', invoice: 'INV-1003', amount: '₹ 60,000', due: '2025-10-25', status: 'Due soon' },
    { customer: 'Umbrella', invoice: 'INV-1004', amount: '₹ 1,20,000', due: '2025-11-02', status: 'Pending' },
  ]

  return (
    <AppLayout title="Dashboard">
      {/* Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-6">
            <div className="text-sm text-secondary-500">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Payments table */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Tracking</h2>
          <Link to="/invoices" className="btn btn-primary btn-sm">Create Invoice</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-secondary-600">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Invoice</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Due Date</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.invoice} className="border-t border-secondary-200">
                  <td className="py-2 pr-4">{p.customer}</td>
                  <td className="py-2 pr-4">{p.invoice}</td>
                  <td className="py-2 pr-4">{p.amount}</td>
                  <td className="py-2 pr-4">{p.due}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.status === 'Paid' ? 'bg-success-100 text-success-700' : p.status === 'Overdue' ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-700'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reports chart (simple CSS chart) */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Revenue Trend</h2>
          <div className="flex items-center gap-2 text-xs">
            <button className="px-2 py-1 rounded border border-secondary-200">Weekly</button>
            <button className="px-2 py-1 rounded border border-secondary-200 bg-secondary-100">Monthly</button>
            <button className="px-2 py-1 rounded border border-secondary-200">Yearly</button>
          </div>
        </div>
        <div className="mt-4">
          <LineChart points={[12, 20, 18, 25, 22, 30, 28, 35, 33, 40, 38, 45]} />
        </div>
      </section>
    </AppLayout>
  )
}

