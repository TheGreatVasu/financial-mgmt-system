import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function AgingAnalysisChart({ data = [] }) {
  const chartData = data.map(item => ({
    period: item.period || item.label || 'Unknown',
    amount: Number(item.amount || item.value || 0),
    count: Number(item.count || 0),
  }));

  const formatCurrency = (value) => {
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const colors = {
    '0-30': '#10b981', // green
    '31-60': '#f59e0b', // amber
    '61-90': '#f97316', // orange
    '90+': '#ef4444', // red
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-secondary-700 mb-1">Aging Analysis of AR Balance</h3>
        <p className="text-xs text-secondary-500">Breakdown of dues by time period</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value) => value === 'amount' ? 'Outstanding Amount' : value}
          />
          <Bar 
            dataKey="amount" 
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={colors[entry.period] || '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: colors[item.period] || '#3b82f6' }}
            />
            <div>
              <div className="font-medium text-secondary-700">{item.period} days</div>
              <div className="text-secondary-500">₹{(item.amount / 1000).toFixed(0)}K</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

