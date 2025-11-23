import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ReferenceLine
} from 'recharts'
import { Download, Rows, Columns } from 'lucide-react'

const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`

const buildCsv = (rows) => {
  if (!rows?.length) return
  const header = ['Invoice', 'Deductions', 'Net Invoice']
  const csv = rows.map((row) => `${row.invoiceNo},${row.deductions},${row.netInvoice}`).join('\n')
  const blob = new Blob([`${header.join(',')}\n${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'deduction-vs-net.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function DeductionComparisonChart({ data = [] }) {
  const [displayCount, setDisplayCount] = useState('20')
  const [layoutMode, setLayoutMode] = useState('grouped') // grouped | stacked

  const chartData = useMemo(() => {
    if (!data?.length) return []
    const normalized = data.map((item) => ({
      invoiceNo: item.invoiceNo || 'N/A',
      deductions: Number(item.deductions || 0),
      netInvoice: Number(item.netInvoice || 0)
    }))

    if (displayCount === 'all') {
      return normalized
    }
    return normalized.slice(0, Number(displayCount))
  }, [data, displayCount])

  if (!chartData.length) {
    return (
      <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0f172a] p-6 flex items-center justify-center h-72 text-secondary-500">
        No deduction comparison data available
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0f172a] p-4 sm:p-6 shadow-lg shadow-secondary-500/10 dark:shadow-black/40">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
            Deduction vs Net Invoice Comparison
          </p>
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
            Tracking {chartData.length} invoices
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={displayCount}
            onChange={(e) => setDisplayCount(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-secondary-200 text-xs font-semibold text-secondary-700 focus:outline-none"
          >
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={() => setLayoutMode('grouped')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${layoutMode === 'grouped'
              ? 'bg-emerald-600 text-white'
              : 'border border-secondary-200 text-secondary-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Grouped
          </button>
          <button
            onClick={() => setLayoutMode('stacked')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${layoutMode === 'stacked'
              ? 'bg-rose-600 text-white'
              : 'border border-secondary-200 text-secondary-700'
            }`}
          >
            <Rows className="w-3.5 h-3.5" />
            Stacked
          </button>
          <button
            onClick={() => buildCsv(chartData)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-secondary-200 text-xs font-semibold text-secondary-700 hover:bg-secondary-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.35)" vertical={false} />
            <XAxis
              dataKey="invoiceNo"
              interval={0}
              angle={-40}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11, fill: 'currentColor' }}
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
              formatter={(value, name) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 16,
                border: '1px solid rgba(148,163,184,0.3)',
                background: 'rgba(15,23,42,0.95)',
                color: 'white'
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#94A3B8" strokeDasharray="3 3" />
            <Bar
              dataKey="deductions"
              name="Deductions"
              stackId={layoutMode === 'stacked' ? 'stack' : undefined}
              fill="#F43F5E"
              radius={[12, 12, 12, 12]}
            />
            <Bar
              dataKey="netInvoice"
              name="Net Invoice"
              stackId={layoutMode === 'stacked' ? 'stack' : undefined}
              fill="#10B981"
              radius={[12, 12, 12, 12]}
            />
            <Brush
              dataKey="invoiceNo"
              height={24}
              stroke="#0EA5E9"
              travellerWidth={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

