import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function TopCustomersTable({ data = [] }) {
  const tableData = data.slice(0, 10).map((item, index) => ({
    rank: index + 1,
    customer: item.customer || 'Unknown',
    overdue: Number(item.overdue || 0),
    totalOutstanding: Number(item.totalOutstanding || item.outstanding || 0),
  }));

  if (tableData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft"
      >
        <div className="mb-4">
          <h3 className="text-sm font-medium text-secondary-700 mb-1">Top 10 Customers by Overdue Amount</h3>
          <p className="text-xs text-secondary-500">Key accounts requiring attention</p>
        </div>
        <div className="flex items-center justify-center h-48 text-secondary-500">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-secondary-400" />
            <p className="text-sm">No overdue customers found</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-primary-200/60 bg-white p-4 md:p-5 shadow-soft"
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-secondary-700 mb-1">Top 10 Customers by Overdue Amount</h3>
        <p className="text-xs text-secondary-500">Key accounts requiring attention</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-200">
              <th className="text-left py-3 px-2 text-secondary-600 font-medium">#</th>
              <th className="text-left py-3 px-2 text-secondary-600 font-medium">Customer</th>
              <th className="text-right py-3 px-2 text-secondary-600 font-medium">Overdue</th>
              <th className="text-right py-3 px-2 text-secondary-600 font-medium hidden sm:table-cell">Total Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                <td className="py-3 px-2 text-secondary-700 font-medium">{row.rank}</td>
                <td className="py-3 px-2 text-secondary-700 font-medium">{row.customer}</td>
                <td className="py-3 px-2 text-right">
                  <span className="font-semibold text-rose-600">
                    ₹{row.overdue.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="py-3 px-2 text-right hidden sm:table-cell text-secondary-600">
                  ₹{row.totalOutstanding.toLocaleString('en-IN')}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary-500">Total Overdue:</span>
          <span className="font-semibold text-rose-600">
            ₹{tableData.reduce((sum, row) => sum + row.overdue, 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

