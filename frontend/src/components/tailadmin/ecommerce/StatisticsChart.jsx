export default function StatisticsChart({ buckets = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Target you've set for each month
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg">
            Monthly
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            Quarterly
          </button>
          <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            Annually
          </button>
        </div>
      </div>

      {/* Bar Chart placeholder wired to buckets */}
      <div className="mb-6">
        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-sm">Aging Buckets</div>
            <div className="text-xs text-gray-400 mt-1">{buckets.length ? buckets.map(b => `${b.label}:${b.value}`).join(' | ') : 'No data'}</div>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-sm">Trend Line Chart (placeholder)</div>
          <div className="text-xs text-gray-400 mt-1">Jan - Dec (0-250 scale)</div>
        </div>
      </div>
    </div>
  );
}
