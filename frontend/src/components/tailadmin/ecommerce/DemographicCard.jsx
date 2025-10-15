export default function DemographicCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Customers Demographic
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Number of customer based on country
        </p>
      </div>

      {/* Demographics Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">United States</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">45%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">United Kingdom</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">25%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Canada</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">15%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Australia</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">10%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Others</span>
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-white/90">5%</span>
        </div>
      </div>
    </div>
  );
}
