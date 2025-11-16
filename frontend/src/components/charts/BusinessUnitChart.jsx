import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function BusinessUnitChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No business unit data available
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.businessUnit || 'Unknown',
    revenue: parseFloat(item.revenue || 0),
    count: item.count || 0
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

