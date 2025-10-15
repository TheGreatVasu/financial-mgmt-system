import { Users, Package, TrendingUp, TrendingDown } from 'lucide-react'

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {/* Customers Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Users className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              3,782
            </h4>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
            <TrendingUp className="w-3 h-3" />
            11.01%
          </div>
        </div>
      </div>

      {/* Orders Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Package className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              5,359
            </h4>
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
            <TrendingDown className="w-3 h-3" />
            9.05%
          </div>
        </div>
      </div>

      {/* Monthly Target Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Target
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Target you've set for each month
          </p>
        </div>

        {/* Gauge Chart */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            <div className="w-full h-full rounded-full border-8 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white/90">75.55%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">+10%</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            You earn $3287 today, it's higher than last month. Keep up your good work!
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Target</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">$20K ↓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Revenue</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">$20K ↑</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
            <span className="text-sm font-medium text-gray-800 dark:text-white/90">$20K ↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}
