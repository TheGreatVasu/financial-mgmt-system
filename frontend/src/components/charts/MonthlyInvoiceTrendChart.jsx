import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function MonthlyInvoiceTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No monthly trend data available
      </div>
    )
  }

  const chartData = data.map(item => ({
    month: item.month || '',
    amount: parseFloat(item.amount || 0),
    count: item.count || 0
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const [year, month] = value.split('-')
            return `${month}/${year.slice(2)}`
          }}
        />
        <YAxis 
          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Invoice Amount']}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Invoice Amount"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

