import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { FileText, TrendingUp, Target, AlertTriangle, Download, RefreshCw, BarChart3 } from 'lucide-react'

export default function BoqActualPage() {
  const { token } = useAuthContext()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submittedBOQData, setSubmittedBOQData] = useState(null)

  const loadDashboardData = useCallback(async () => {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const d = await fetchDashboard(token, { range: '90d' })
      setData(d)
    } catch (e) {
      setError(e?.message || 'Failed to load BOQ vs Actual data')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // Check for submitted BOQ data in sessionStorage
    const storedBOQData = sessionStorage.getItem('submittedBOQData')
    if (storedBOQData) {
      try {
        const parsed = JSON.parse(storedBOQData)
        setSubmittedBOQData(parsed)
      } catch (e) {
        console.error('Failed to parse submitted BOQ data', e)
      }
    }
    
    // Load dashboard data from API
    loadDashboardData()
  }, [loadDashboardData, location.key]) // Reload when navigating to this page

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  // Process BOQ data from API and merge with newly submitted data
  let boq, actual, labels, chartData, totalBOQ, totalActual, totalVariance, variancePercent

  // Get API data (from database)
  const boqVsActual = data?.boqVsActual || {}
  boq = [...(boqVsActual.boq || [])]
  actual = [...(boqVsActual.actual || [])]
  labels = boqVsActual.labels || ['Q1','Q2','Q3','Q4','Q5','Q6']

  // If we have newly submitted BOQ data, calculate its value and add to appropriate quarter
  if (submittedBOQData) {
    const boqSummary = submittedBOQData.summary || {}
    let submittedBOQValue = 0

    // Calculate BOQ value from line items (preferred method)
    if (submittedBOQData.lineItems && Array.isArray(submittedBOQData.lineItems)) {
      submittedBOQValue = submittedBOQData.lineItems.reduce((sum, item) => {
        // Use totalAmount (line total) if available
        if (item.totalAmount) {
          return sum + (parseFloat(item.totalAmount) || 0)
        }
        // Otherwise calculate: qty * unitCost + freight
        const qty = parseFloat(item.qty) || 0
        const unitCost = parseFloat(item.unitCost) || 0
        const freight = parseFloat(item.freight) || 0
        return sum + (qty * unitCost) + freight
      }, 0)
    }

    // Fallback to summary totalPOValue if line items calculation is 0
    if (submittedBOQValue === 0 && boqSummary.totalPOValue) {
      submittedBOQValue = parseFloat(boqSummary.totalPOValue || 0)
    }
    
    if (submittedBOQValue > 0) {
      // Determine quarter based on PO date if available, otherwise use current date
      let quarterIndex = 0
      if (submittedBOQData.poDate) {
        try {
          const poDate = new Date(submittedBOQData.poDate)
          if (!isNaN(poDate.getTime())) {
            const month = poDate.getMonth() // 0-11
            quarterIndex = Math.floor(month / 2) // 0-5 for 6 quarters (2 months each)
            quarterIndex = Math.min(quarterIndex, 5) // Ensure it's within bounds
          }
        } catch (e) {
          console.warn('Failed to parse PO date, using current quarter:', e)
        }
      }
      
      if (quarterIndex === 0) {
        // Fallback to current quarter if PO date not available
        const currentMonth = new Date().getMonth()
        quarterIndex = Math.min(Math.floor(currentMonth / 2), 5)
      }
      
      // Add the submitted BOQ value to the appropriate quarter
      boq[quarterIndex] = (boq[quarterIndex] || 0) + submittedBOQValue
    }
  }

  // Create chart data from the combined BOQ and actual arrays
  chartData = labels.map((label, index) => ({
    quarter: label,
    boq: boq[index] || 0,
    actual: actual[index] || 0,
    variance: (actual[index] || 0) - (boq[index] || 0),
    variancePercent: boq[index] > 0 ? (((actual[index] || 0) - (boq[index] || 0)) / boq[index] * 100).toFixed(1) : 0,
  }))

  // Calculate totals from aggregated data
  totalBOQ = boq.reduce((sum, val) => sum + (val || 0), 0)
  totalActual = actual.reduce((sum, val) => sum + (val || 0), 0)
  totalVariance = totalActual - totalBOQ
  variancePercent = totalBOQ > 0 ? ((totalVariance / totalBOQ) * 100).toFixed(1) : 0

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900">BOQ vs Actual Supplies</h1>
            <p className="text-sm sm:text-base text-secondary-600 mt-1">
              Compare Bill of Quantities (BOQ) with actual supplies delivered
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                // Clear submitted data on refresh to show only database data
                setSubmittedBOQData(null)
                sessionStorage.removeItem('submittedBOQData')
                await loadDashboardData()
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-secondary-200/80 bg-white px-3 py-2 shadow-inner hover:border-primary-200 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-primary-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-semibold">Refresh</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">{error}</div>
        ) : null}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total BOQ Value</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-blue-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(totalBOQ)}
            </p>
          </div>

          <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Actual</h3>
            <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-emerald-600 transition-colors duration-300">
              {loading ? '—' : formatCurrency(totalActual)}
            </p>
          </div>

          <div className={`group rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
            totalVariance >= 0 ? 'border-emerald-200/70 hover:border-emerald-200/50' : 'border-red-200/70 hover:border-red-200/50'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 ${
                totalVariance >= 0 ? 'bg-gradient-to-br from-emerald-100 to-emerald-50' : 'bg-gradient-to-br from-red-100 to-red-50'
              }`}>
                <BarChart3 className={`w-5 h-5 sm:w-6 sm:h-6 ${totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Variance</h3>
            <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              totalVariance >= 0 ? 'text-emerald-600 group-hover:text-emerald-700' : 'text-red-600 group-hover:text-red-700'
            }`}>
              {loading ? '—' : `${totalVariance >= 0 ? '+' : ''}${formatCurrency(totalVariance)}`}
            </p>
          </div>

          <div className={`group rounded-xl sm:rounded-2xl border bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
            variancePercent >= 0 ? 'border-purple-200/70 hover:border-purple-200/50' : 'border-orange-200/70 hover:border-orange-200/50'
          }`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2.5 sm:p-3 rounded-lg group-hover:scale-110 transition-transform duration-300 ${
                variancePercent >= 0 ? 'bg-gradient-to-br from-purple-100 to-purple-50' : 'bg-gradient-to-br from-orange-100 to-orange-50'
              }`}>
                <TrendingUp className={`w-5 h-5 sm:w-6 sm:h-6 ${variancePercent >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
              </div>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Variance %</h3>
            <p className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              variancePercent >= 0 ? 'text-purple-600 group-hover:text-purple-700' : 'text-orange-600 group-hover:text-orange-700'
            }`}>
              {loading ? '—' : `${variancePercent >= 0 ? '+' : ''}${variancePercent}%`}
            </p>
          </div>
        </div>

        {/* BOQ vs Actual Comparison Chart */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">BOQ vs Actual Comparison</div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `₹${(value / 1000).toFixed(0)}K`
                  }
                  return `₹${value.toFixed(0)}`
                }}
                domain={[0, 'auto']}
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
              <Legend />
              <Bar 
                dataKey="boq" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="BOQ"
              />
              <Bar 
                dataKey="actual" 
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Actual"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Variance Trend Chart */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Variance Trend</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="variance" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
                name="Variance"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BOQ Line Items Table (if submitted data exists) */}
        {submittedBOQData && submittedBOQData.lineItems && submittedBOQData.lineItems.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <div className="text-sm sm:text-base font-semibold text-secondary-700">BOQ Line Items</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-secondary-500 border-b border-secondary-200">
                    <th className="py-3 pr-4 font-semibold">Material Description</th>
                    <th className="py-3 pr-4 font-semibold text-right">Qty</th>
                    <th className="py-3 pr-4 font-semibold text-center">UOM</th>
                    <th className="py-3 pr-4 font-semibold text-right">Unit Price</th>
                    <th className="py-3 pr-4 font-semibold text-right">Unit Cost</th>
                    <th className="py-3 pr-4 font-semibold text-right">Freight / Other Charges</th>
                    <th className="py-3 pr-4 font-semibold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedBOQData.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-secondary-100/80 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-secondary-900">{item.materialDescription || '—'}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{item.qty || '—'}</td>
                      <td className="py-3 pr-4 text-center text-secondary-700">{item.uom || '—'}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{item.unitPrice ? formatCurrency(item.unitPrice) : '—'}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{item.unitCost ? formatCurrency(item.unitCost) : '—'}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{item.freight ? formatCurrency(item.freight) : '—'}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-secondary-900">{item.totalAmount ? formatCurrency(item.totalAmount) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                {submittedBOQData.summary && (
                  <tfoot>
                    <tr className="border-t-2 border-secondary-300 font-bold bg-secondary-50">
                      <td colSpan="5" className="py-3 pr-4 text-secondary-900">BOQ Summary</td>
                      <td className="py-3 pr-4 text-right text-secondary-900">
                        {submittedBOQData.summary.totalFreightAmount ? formatCurrency(submittedBOQData.summary.totalFreightAmount) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right text-secondary-900">
                        {submittedBOQData.summary.totalPOValue ? formatCurrency(submittedBOQData.summary.totalPOValue) : '—'}
                      </td>
                    </tr>
                    <tr className="border-t border-secondary-200 font-semibold text-xs text-secondary-600 bg-secondary-50">
                      <td colSpan="4" className="py-2 pr-4"></td>
                      <td className="py-2 pr-4 text-right">
                        <span className="font-semibold">Total Ex-Works:</span> {submittedBOQData.summary.totalExWorks ? formatCurrency(submittedBOQData.summary.totalExWorks) : '—'}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <span className="font-semibold">Total Freight:</span> {submittedBOQData.summary.totalFreightAmount ? formatCurrency(submittedBOQData.summary.totalFreightAmount) : '—'}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <span className="font-semibold">GST:</span> {submittedBOQData.summary.gst ? formatCurrency(submittedBOQData.summary.gst) : '—'}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Detailed Comparison Table */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">
              {submittedBOQData ? 'BOQ Summary' : 'Quarterly Breakdown'}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-secondary-500 border-b border-secondary-200">
                  <th className="py-3 pr-4 font-semibold">Quarter</th>
                  <th className="py-3 pr-4 font-semibold text-right">BOQ Value</th>
                  <th className="py-3 pr-4 font-semibold text-right">Actual Value</th>
                  <th className="py-3 pr-4 font-semibold text-right">Variance</th>
                  <th className="py-3 pr-4 font-semibold text-right">Variance %</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => {
                  const isPositive = row.variance >= 0
                  const isOnTarget = Math.abs(row.variancePercent) <= 5
                  return (
                    <tr key={index} className="border-b border-secondary-100/80 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-secondary-900">{row.quarter}</td>
                      <td className="py-3 pr-4 text-right text-secondary-700">{formatCurrency(row.boq)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-secondary-900">{formatCurrency(row.actual)}</td>
                      <td className={`py-3 pr-4 text-right font-semibold ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{formatCurrency(row.variance)}
                      </td>
                      <td className={`py-3 pr-4 text-right font-semibold ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{row.variancePercent}%
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isOnTarget ? 'bg-emerald-100 text-emerald-700' :
                          isPositive ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {isOnTarget ? 'On Target' : isPositive ? 'Over Target' : 'Under Target'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-secondary-300 font-bold">
                  <td className="py-3 pr-4 text-secondary-900">Total</td>
                  <td className="py-3 pr-4 text-right text-secondary-900">{formatCurrency(totalBOQ)}</td>
                  <td className="py-3 pr-4 text-right text-secondary-900">{formatCurrency(totalActual)}</td>
                  <td className={`py-3 pr-4 text-right ${
                    totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                  </td>
                  <td className={`py-3 pr-4 text-right ${
                    variancePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {variancePercent >= 0 ? '+' : ''}{variancePercent}%
                  </td>
                  <td className="py-3 pr-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
