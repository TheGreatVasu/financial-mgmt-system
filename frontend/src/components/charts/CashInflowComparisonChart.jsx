import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function CashInflowComparisonChart({ data = [] }) {
  const chartData = data.map(item => ({
    month: item.month || 'Unknown',
    actual: Number(item.actual || 0),
    estimated: Number(item.estimated || 0),
  }));

  const formatCurrency = (value) => {
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-secondary-700 mb-1">Actual vs Estimated Cash Inflow</h3>
        <p className="text-xs text-secondary-500">Financial projections tracking</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#10b981" 
            strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Actual"
            animationDuration={800}
          />
          <Line 
            type="monotone" 
            dataKey="estimated" 
            stroke="#3b82f6" 
            strokeWidth={2.5}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Estimated"
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-secondary-600">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-secondary-600">Estimated</span>
        </div>
      </div>
    </motion.div>
  );
}

