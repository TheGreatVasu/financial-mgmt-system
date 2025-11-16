import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DeductionComparisonChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No deduction comparison data available
      </div>
    )
  }

  // Limit to top 20 for readability
  const chartData = data
    .slice(0, 20)
    .map(item => ({
      invoiceNo: item.invoiceNo || 'N/A',
      deductions: parseFloat(item.deductions || 0),
      netInvoice: parseFloat(item.netInvoice || 0)
    }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="invoiceNo" 
          angle={-45} 
          textAnchor="end" 
          height={100}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Bar dataKey="deductions" fill="#ef4444" name="Deductions" radius={[8, 8, 0, 0]} />
        <Bar dataKey="netInvoice" fill="#10b981" name="Net Invoice" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

