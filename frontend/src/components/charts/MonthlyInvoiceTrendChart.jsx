import { useMemo, useState, useRef } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceDot
} from 'recharts'
import { Download, LineChart as LineIcon, Waves } from 'lucide-react'

const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`

const downloadCsv = (rows) => {
  if (!rows?.length) return
  const header = ['Month', 'Invoice Amount']
  const csv = rows
    .map((row) => `${row.label},${row.amount}`)
    .join('\n')
  const blob = new Blob([`${header.join(',')}\n${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'monthly-invoice-trend.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function MonthlyInvoiceTrendChart({ data = [] }) {
  const [viewMode, setViewMode] = useState('line')
  const chartRef = useRef(null)

  const chartData = useMemo(() => {
    if (!data?.length) return []
    return data
      .map((item) => {
        const safeAmount = Number(item.amount || 0)
        const [year = '', month = ''] = (item.month || '').split('-')
        const label = month && year ? `${month}/${year.slice(2)}` : item.month || ''
        return {
          month: item.month || label,
          label,
          amount: safeAmount,
          tooltipLabel: `${label} · ${formatCurrency(safeAmount)}`,
        }
      })
      .sort((a, b) => new Date(a.month) - new Date(b.month))
  }, [data])

  if (!chartData.length) {
    return (
      <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0f172a] p-6 flex items-center justify-center h-72 text-secondary-500">
        No monthly trend data available
      </div>
    )
  }

  const latestPoint = chartData[chartData.length - 1]

  return (
    <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0f172a] p-4 sm:p-6 shadow-lg shadow-secondary-500/10 dark:shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
            Month-wise Invoice Trend
          </p>
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
            {formatCurrency(latestPoint.amount)} latest month
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('line')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === 'line'
              ? 'bg-primary-600 text-white'
              : 'border border-secondary-200 text-secondary-700'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            Line
          </button>
          <button
            onClick={() => setViewMode('area')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === 'area'
              ? 'bg-primary-600 text-white'
              : 'border border-secondary-200 text-secondary-700'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Area
          </button>
          <button
            onClick={() => downloadCsv(chartData)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-secondary-200 text-xs font-semibold text-secondary-700 hover:bg-secondary-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      <div ref={chartRef} className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="invoiceTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'currentColor' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: 'currentColor' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              labelFormatter={(label) => label}
              contentStyle={{
                borderRadius: 16,
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.95)',
                color: 'white'
              }}
            />
            <Legend />
            {viewMode === 'area' && (
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#4F46E5"
                fill="url(#invoiceTrendGradient)"
                strokeWidth={2.5}
                dot={false}
                name="Invoice Amount"
              />
            )}
            {viewMode === 'line' && (
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6 }}
                name="Invoice Amount"
              />
            )}
            <ReferenceDot
              x={latestPoint.label}
              y={latestPoint.amount}
              r={6}
              fill="#38BDF8"
              stroke="white"
              strokeWidth={2}
            />
            <Brush
              dataKey="label"
              height={24}
              stroke="#4F46E5"
              travellerWidth={12}
              className="text-secondary-500"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

