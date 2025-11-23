import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Search, Download } from 'lucide-react'
import { format } from 'date-fns'

export default function SalesInvoiceMasterTable({ invoices = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [regionFilter, setRegionFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [overdueOnly, setOverdueOnly] = useState(false)

  // Key fields to display in the table
  const keyFields = [
    { key: 'gst_tax_invoice_no', label: 'GST Invoice No', width: 'w-32' },
    { key: 'gst_tax_invoice_date', label: 'Invoice Date', width: 'w-28' },
    { key: 'customer_name', label: 'Customer', width: 'w-48' },
    { key: 'business_unit', label: 'Business Unit', width: 'w-32' },
    { key: 'region', label: 'Region', width: 'w-24' },
    { key: 'zone', label: 'Zone', width: 'w-24' },
    { key: 'total_invoice_value', label: 'Invoice Value', width: 'w-32', type: 'currency' },
    { key: 'total_balance', label: 'Balance', width: 'w-32', type: 'currency' },
    { key: 'over_due_total', label: 'Overdue', width: 'w-32', type: 'currency' }
  ]

  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(invoices.map(inv => (inv.region || '').toLowerCase()).filter(Boolean))).sort()
  }, [invoices])

  const uniqueUnits = useMemo(() => {
    return Array.from(new Set(invoices.map(inv => (inv.business_unit || '').toLowerCase()).filter(Boolean))).sort()
  }, [invoices])

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = invoices
      .filter(inv => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
          (inv.gst_tax_invoice_no || '').toLowerCase().includes(search) ||
          (inv.internal_invoice_no || '').toLowerCase().includes(search) ||
          (inv.customer_name || '').toLowerCase().includes(search) ||
          (inv.business_unit || '').toLowerCase().includes(search) ||
          (inv.region || '').toLowerCase().includes(search) ||
          (inv.zone || '').toLowerCase().includes(search)
        )
      })
      .filter(inv => {
        if (regionFilter !== 'all' && (inv.region || '').toLowerCase() !== regionFilter) {
          return false
        }
        if (unitFilter !== 'all' && (inv.business_unit || '').toLowerCase() !== unitFilter) {
          return false
        }
        if (overdueOnly && !(parseFloat(inv.over_due_total || 0) > 0)) {
          return false
        }
        return true
      })

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        
        if (sortConfig.key.includes('date')) {
          const aDate = aVal ? new Date(aVal).getTime() : 0
          const bDate = bVal ? new Date(bVal).getTime() : 0
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
        }
        
        if (typeof aVal === 'number' || typeof bVal === 'number') {
          return sortConfig.direction === 'asc' 
            ? (parseFloat(aVal || 0) - parseFloat(bVal || 0))
            : (parseFloat(bVal || 0) - parseFloat(aVal || 0))
        }
        
        const aStr = (aVal || '').toString().toLowerCase()
        const bStr = (bVal || '').toString().toLowerCase()
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      })
    }

    return filtered
  }, [invoices, searchTerm, sortConfig])

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    try {
      return format(new Date(date), 'dd/MM/yyyy')
    } catch {
      return '-'
    }
  }

const buildCsv = (rows) => {
  const headers = ['GST Invoice', 'Invoice Date', 'Customer', 'Business Unit', 'Region', 'Zone', 'Invoice Value', 'Balance', 'Overdue']
  const body = rows
    .map(inv => [
      inv.gst_tax_invoice_no,
      inv.gst_tax_invoice_date,
      inv.customer_name,
      inv.business_unit,
      inv.region,
      inv.zone,
      inv.total_invoice_value,
      inv.total_balance,
      inv.over_due_total
    ].map(value => JSON.stringify(value ?? '')).join(','))
    .join('\n')
  return `${headers.join(',')}\n${body}`
}

const downloadCsv = (rows) => {
  if (!rows.length) return
  const csv = buildCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'invoice-master-table.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

  if (loading) {
    return (
      <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-secondary-200 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-secondary-200/60 bg-white shadow-xl shadow-secondary-500/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-secondary-200 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Invoice Master Table</h3>
            <p className="text-sm text-secondary-500 mt-1">
              Showing {paginatedData.length} of {filteredData.length} invoices
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => downloadCsv(filteredData)}
              disabled={!filteredData.length}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary-300 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All regions</option>
            {uniqueRegions.map((region) => (
              <option key={region} value={region}>
                {region.toUpperCase()}
              </option>
            ))}
          </select>
          <select
            value={unitFilter}
            onChange={(e) => {
              setUnitFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-1.5 border border-secondary-200 rounded-lg text-sm text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All business units</option>
            {uniqueUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit.toUpperCase()}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-secondary-200 text-sm text-secondary-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => {
                setOverdueOnly(e.target.checked)
                setCurrentPage(1)
              }}
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            Overdue only
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-secondary-700">
          <thead className="bg-white border-b border-secondary-200 shadow-sm sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-12">
                #
              </th>
              {keyFields.map((field) => (
                <th
                  key={field.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors ${field.width}`}
                  onClick={() => handleSort(field.key)}
                >
                  <div className="flex items-center gap-2">
                    {field.label}
                    {sortConfig.key === field.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-700 uppercase tracking-wider w-12">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={keyFields.length + 2} className="px-4 py-12 text-center text-secondary-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              paginatedData.map((invoice, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index
                const isExpanded = expandedRows.has(globalIndex)
                return (
                  <React.Fragment key={invoice.id || index}>
                    <tr className="hover:bg-secondary-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-secondary-600">
                        {globalIndex + 1}
                      </td>
                      {keyFields.map((field) => (
                        <td key={field.key} className="px-4 py-3 text-sm">
                          {field.type === 'currency' ? (
                            <span className="font-medium text-secondary-900">
                              {formatCurrency(invoice[field.key])}
                            </span>
                          ) : field.key.includes('date') ? (
                            <span className="text-secondary-700">
                              {formatDate(invoice[field.key])}
                            </span>
                          ) : (
                            <span className="text-secondary-700 truncate block max-w-xs">
                              {invoice[field.key] || '-'}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(globalIndex)}
                          className="p-1 rounded hover:bg-secondary-100 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-secondary-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-secondary-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-secondary-50">
                        <td colSpan={keyFields.length + 2} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-secondary-500">Internal Invoice No:</span>
                              <span className="ml-2 font-medium">{invoice.internal_invoice_no || '-'}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">PO No:</span>
                              <span className="ml-2 font-medium">{invoice.po_no_reference || '-'}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Sales Order No:</span>
                              <span className="ml-2 font-medium">{invoice.sales_order_no || '-'}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Material:</span>
                              <span className="ml-2 font-medium truncate block">{invoice.material_description || '-'}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Qty:</span>
                              <span className="ml-2 font-medium">{invoice.qty || 0} {invoice.unit || ''}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Basic Value:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.basic_value)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Freight:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.freight_value)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Subtotal:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">CGST:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.cgst_output)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">SGST:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.sgst_output)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">IGST:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.igst_output)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">TCS:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.tcs)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">1st Due:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.first_due_amount)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">2nd Due:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.second_due_amount)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">3rd Due:</span>
                              <span className="ml-2 font-medium">{formatCurrency(invoice.third_due_amount)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Penalty/LD:</span>
                              <span className="ml-2 font-medium text-danger-600">{formatCurrency(invoice.penalty_ld_deduction)}</span>
                            </div>
                            <div>
                              <span className="text-secondary-500">Bad Debts:</span>
                              <span className="ml-2 font-medium text-danger-600">{formatCurrency(invoice.bad_debts)}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-secondary-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-secondary-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-secondary-300 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-secondary-300 text-sm font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

