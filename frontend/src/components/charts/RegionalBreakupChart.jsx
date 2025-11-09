import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function RegionalBreakupChart({ data = [] }) {
  const chartData = data.map(item => ({
    name: item.region || 'Unknown',
    value: Number(item.overdue || item.value || 0),
    amount: Number(item.amount || 0),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatCurrency = (value) => {
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Overdue: <span className="font-semibold">₹{Number(payload[0].value).toLocaleString('en-IN')}</span>
          </p>
          <p className="text-xs text-gray-500">
            Total: ₹{Number(payload[0].payload.amount).toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-secondary-700 mb-1">Overdue Balance Breakup by Region</h3>
        <p className="text-xs text-secondary-500">Regional performance overview</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-secondary-700">{item.name}</span>
            </div>
            <span className="font-medium text-secondary-900">
              ₹{(item.value / 1000).toFixed(0)}K
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

