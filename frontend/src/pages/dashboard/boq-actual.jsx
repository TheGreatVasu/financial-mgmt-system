import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { fetchDashboard } from '../../services/dashboardService.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { FileText, TrendingUp, Target, AlertTriangle, Download, RefreshCw, BarChart3 } from 'lucide-react'

export default function BoqActualPage() {
  const { token } = useAuthContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!token) return
      setLoading(true)
      setError("")
      try {
        const d = await fetchDashboard(token, { range: '90d' })
        if (mounted) setData(d)
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load BOQ vs Actual data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`
  }

  const boqVsActual = data?.boqVsActual || {}
  const boq = boqVsActual.boq || []
  const actual = boqVsActual.actual || []
  const labels = boqVsActual.labels || ['Q1','Q2','Q3','Q4','Q5','Q6']

  const chartData = labels.map((label, index) => ({
    quarter: label,
    boq: boq[index] || 0,
    actual: actual[index] || 0,
    variance: (actual[index] || 0) - (boq[index] || 0),
    variancePercent: boq[index] > 0 ? (((actual[index] || 0) - (boq[index] || 0)) / boq[index] * 100).toFixed(1) : 0,
  }))

  const totalBOQ = boq.reduce((sum, val) => sum + (val || 0), 0)
  const totalActual = actual.reduce((sum, val) => sum + (val || 0), 0)
  const totalVariance = totalActual - totalBOQ
  const variancePercent = totalBOQ > 0 ? ((totalVariance / totalBOQ) * 100).toFixed(1) : 0

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
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-secondary-200/80 bg-white px-3 py-2 shadow-inner hover:border-primary-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-primary-600" />
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

        {/* Detailed Comparison Table */}
        <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <div className="text-sm sm:text-base font-semibold text-secondary-700">Quarterly Breakdown</div>
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
