import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export default function TaxBreakupChart({ data = {} }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-secondary-500">
        No tax data available
      </div>
    )
  }

  const chartData = [
    { name: 'CGST', value: parseFloat(data.cgst || 0), color: '#3b82f6' },
    { name: 'SGST', value: parseFloat(data.sgst || 0), color: '#10b981' },
    { name: 'IGST', value: parseFloat(data.igst || 0), color: '#f59e0b' },
    { name: 'UGST', value: parseFloat(data.ugst || 0), color: '#ef4444' },
    { name: 'TCS', value: parseFloat(data.tcs || 0), color: '#8b5cf6' }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis 
          tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Tax Amount']}
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Legend />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

