import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function RegionZoneChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No region/zone data available
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.region || 'Unknown',
    zone: item.zone || 'Unknown',
    label: `${item.region || 'Unknown'} - ${item.zone || 'Unknown'}`,
    amount: parseFloat(item.amount || 0),
    count: item.count || 0
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="label" 
          angle={-45} 
          textAnchor="end" 
          height={100}
          tick={{ fontSize: 12 }}
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
        <Bar dataKey="amount" fill="#3b82f6" name="Invoice Amount" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

