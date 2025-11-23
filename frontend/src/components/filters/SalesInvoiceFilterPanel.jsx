import { useState, useEffect, useMemo } from 'react'
import { Filter, X, Calendar, DollarSign, Users, Building2, MapPin, FileText, Receipt } from 'lucide-react'

export default function SalesInvoiceFilterPanel({ 
  filters, 
  onFiltersChange, 
  availableOptions = {} 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters || {})

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters || {})
  }, [filters])

  // Get unique options from available data
  const {
    customers = [],
    businessUnits = [],
    regions = [],
    zones = [],
    invoiceTypes = [],
    taxTypes = ['CGST', 'SGST', 'IGST', 'UGST', 'TCS']
  } = availableOptions

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilter = (key) => {
    const newFilters = { ...localFilters }
    delete newFilters[key]
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = useMemo(() => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key]
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }).length
  }, [localFilters])

  return (
    <div className="rounded-2xl border border-secondary-200/60 bg-white shadow-soft mb-6">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary-50 transition-colors rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-secondary-900">Filters</h3>
            <p className="text-xs text-secondary-500">
              {activeFilterCount > 0 
                ? `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`
                : 'No filters applied'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearAllFilters()
              }}
              className="px-3 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <X className="w-5 h-5 text-secondary-500" />
          </div>
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t border-secondary-200">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <Calendar className="w-4 h-4" />
              Invoice Date Range
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="w-full px-3 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  aria-label="Date from"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">From</p>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="w-full px-3 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  aria-label="Date to"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">To</p>
              </div>
            </div>
            {(localFilters.dateFrom || localFilters.dateTo) && (
              <button
                onClick={() => {
                  clearFilter('dateFrom')
                  clearFilter('dateTo')
                }}
                className="text-xs text-danger-600 hover:text-danger-700"
              >
                Clear date range
              </button>
            )}
          </div>

          {/* Customer Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <Users className="w-4 h-4" />
              Customer
            </label>
            <select
              value={localFilters.customer || ''}
              onChange={(e) => updateFilter('customer', e.target.value || null)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 modern-select appearance-none"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer} value={customer}>
                  {customer}
                </option>
              ))}
            </select>
          </div>

          {/* Business Unit Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <Building2 className="w-4 h-4" />
              Business Unit
            </label>
            <select
              value={localFilters.businessUnit || ''}
              onChange={(e) => updateFilter('businessUnit', e.target.value || null)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 modern-select appearance-none"
            >
              <option value="">All Business Units</option>
              {businessUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Region/Zone Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
                <MapPin className="w-4 h-4" />
                Region
              </label>
              <select
                value={localFilters.region || ''}
                onChange={(e) => updateFilter('region', e.target.value || null)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 modern-select appearance-none"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
                <MapPin className="w-4 h-4" />
                Zone
              </label>
              <select
                value={localFilters.zone || ''}
                onChange={(e) => updateFilter('zone', e.target.value || null)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 modern-select appearance-none"
              >
                <option value="">All Zones</option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoice Type Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <FileText className="w-4 h-4" />
              Invoice Type
            </label>
            <select
              value={localFilters.invoiceType || ''}
              onChange={(e) => updateFilter('invoiceType', e.target.value || null)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 modern-select appearance-none"
            >
              <option value="">All Types</option>
              {invoiceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Tax Type Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <Receipt className="w-4 h-4" />
              Tax Type
            </label>
            <div className="flex flex-wrap gap-2">
              {taxTypes.map((taxType) => {
                const isSelected = localFilters.taxTypes?.includes(taxType) || false
                return (
                  <button
                    key={taxType}
                    onClick={() => {
                      const current = localFilters.taxTypes || []
                      const updated = isSelected
                        ? current.filter(t => t !== taxType)
                        : [...current, taxType]
                      updateFilter('taxTypes', updated.length > 0 ? updated : null)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {taxType}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Amount Range Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-secondary-700">
              <DollarSign className="w-4 h-4" />
              Invoice Amount Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min amount"
                  value={localFilters.amountMin || ''}
                  onChange={(e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max amount"
                  value={localFilters.amountMax || ''}
                  onChange={(e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

