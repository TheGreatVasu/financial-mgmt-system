import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Brush,
  ReferenceLine,
} from "recharts";
import {
  CalendarDays,
  Search,
  Download,
  PieChart as PieIcon,
  Circle,
  Columns,
  Rows,
  ChevronDown,
} from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

const colors = [
  "#4F46E5",
  "#0EA5E9",
  "#10B981",
  "#F97316",
  "#F43F5E",
  "#8B5CF6",
  "#14B8A6",
  "#FACC15",
  "#EC4899",
  "#3B82F6",
];

const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatSize = (value = 0) =>
  `₹${(value / 100000).toFixed(1)}L`;

const exportCsv = (rows = [], headers = [], filename = "export.csv") => {
  if (!rows.length || !headers.length) return;
  const body = rows
    .map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
    )
    .join("\n");
  const csvContent = `${headers.join(",")}\n${body}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportPng = async (ref, filename) => {
  if (!ref?.current) return;
  const dataUrl = await toPng(ref.current, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "white",
  });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

const exportPdf = async (ref, filename) => {
  if (!ref?.current) return;
  const dataUrl = await toPng(ref.current, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "white",
  });
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1000, 600],
  });
  pdf.addImage(dataUrl, "PNG", 24, 24, 952, 552);
  pdf.save(filename);
};

export default function AdvancedRevenueCharts({
  customerData = [],
  taxData = {},
  loading = false,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [taxFilter, setTaxFilter] = useState("all");
  const [amountRange, setAmountRange] = useState([0, 0]);
  const [customerChartType, setCustomerChartType] = useState("pie"); // pie | donut
  const [taxOrientation, setTaxOrientation] = useState("column"); // column | bar
  const [activeIndex, setActiveIndex] = useState(null);

  const customerChartRef = useRef(null);
  const taxChartRef = useRef(null);

  const normalizedCustomers = useMemo(() => {
    return (customerData || []).map((item, index) => ({
      id: `${item.customer || item.name || "Customer"}-${index}`,
      customer: item.customer || item.name || `Customer ${index + 1}`,
      amount: Number(item.amount || item.value || 0),
      count: item.count || item.invoices || 0,
      category: item.category || item.segment || "General",
      date: item.date || item.invoiceDate || null,
    }));
  }, [customerData]);

  const normalizedTax = useMemo(() => {
    const entries = [];
    if (!taxData || Object.keys(taxData).length === 0) return entries;
    ["cgst", "sgst", "igst", "ugst", "tcs"].forEach((type) => {
      if (taxData[type] != null) {
        entries.push({
          name: type.toUpperCase(),
          value: Number(taxData[type] || 0),
        });
      }
    });
    return entries;
  }, [taxData]);

  const amountStats = useMemo(() => {
    if (!normalizedCustomers.length) return { min: 0, max: 0 };
    const amounts = normalizedCustomers.map((item) => item.amount);
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    };
  }, [normalizedCustomers]);

  useEffect(() => {
    setAmountRange([amountStats.min, amountStats.max]);
  }, [amountStats.min, amountStats.max]);

  const filteredCustomers = useMemo(() => {
    return normalizedCustomers
      .filter((item) => {
        if (startDate) {
          if (!item.date || new Date(item.date) < new Date(startDate)) {
            return false;
          }
        }
        if (endDate) {
          if (!item.date || new Date(item.date) > new Date(endDate)) {
            return false;
          }
        }
        if (
          categoryFilter !== "all" &&
          item.category.toLowerCase() !== categoryFilter
        ) {
          return false;
        }
        if (item.amount < amountRange[0] || item.amount > amountRange[1]) {
          return false;
        }
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return item.customer.toLowerCase().includes(term);
        }
        return true;
      })
      .sort((a, b) => b.amount - a.amount);
  }, [
    normalizedCustomers,
    startDate,
    endDate,
    categoryFilter,
    amountRange,
    amountStats.min,
    amountStats.max,
    searchTerm,
  ]);

  const filteredTax = useMemo(() => {
    if (taxFilter === "all") return normalizedTax;
    return normalizedTax.filter(
      (entry) => entry.name.toLowerCase() === taxFilter.toLowerCase()
    );
  }, [normalizedTax, taxFilter]);

  const categories = useMemo(() => {
    const set = new Set(normalizedCustomers.map((item) => item.category.toLowerCase()));
    return Array.from(set);
  }, [normalizedCustomers]);

  const taxTypes = ["all", ...normalizedTax.map((item) => item.name.toLowerCase())];

  const customerTotals = filteredCustomers.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const handleExport = async (target, type) => {
    if (type === "csv") {
      if (target === "customers") {
        exportCsv(
          filteredCustomers,
          ["customer", "amount", "count", "category"],
          "customer-contribution.csv"
        );
      } else {
        exportCsv(
          filteredTax,
          ["name", "value"],
          "tax-breakup.csv"
        );
      }
      return;
    }
    if (target === "customers") {
      if (type === "png") {
        await exportPng(customerChartRef, "customer-contribution.png");
      } else {
        await exportPdf(customerChartRef, "customer-contribution.pdf");
      }
    } else if (target === "tax") {
      if (type === "png") {
        await exportPng(taxChartRef, "tax-breakup.png");
      } else {
        await exportPdf(taxChartRef, "tax-breakup.pdf");
      }
    }
  };

  const chartCardClasses =
    "rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0f172a] shadow-lg shadow-secondary-500/10 dark:shadow-black/40 p-4 sm:p-6";
  const filterInputClass =
    "w-full h-12 rounded-2xl border border-secondary-200/70 dark:border-secondary-700 bg-white dark:bg-secondary-900/60 px-4 pr-10 text-sm font-medium text-secondary-800 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
  const selectInputClass = `${filterInputClass} appearance-none modern-select`;
  const isBarLayout = taxOrientation === "bar";

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0b1220] shadow-xl shadow-secondary-500/10 dark:shadow-black/60 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-secondary-500 dark:text-secondary-400">
              Contribution & Tax Insights
            </p>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Intelligent Filters & Controls
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              Date Range
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${filterInputClass} pl-12 pr-4`}
                  aria-label="Start date"
                />
                <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400 dark:text-secondary-500 pointer-events-none z-10" />
              </div>
              <div className="relative flex-1">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`${filterInputClass} pl-12 pr-4`}
                  aria-label="End date"
                />
                <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400 dark:text-secondary-500 pointer-events-none z-10" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              Customer Category
            </p>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={selectInputClass}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              Tax Type
            </p>
            <div className="relative">
              <select
                value={taxFilter}
                onChange={(e) => setTaxFilter(e.target.value)}
                className={selectInputClass}
              >
                {taxTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              Search Customers
            </p>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                className={`${filterInputClass} pl-12`}
              />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            </div>
          </div>

          <div className="space-y-3 col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              Contribution Amount Range
            </p>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              <span>{formatCurrency(amountRange[0])}</span>
              <span>{formatCurrency(amountRange[1])}</span>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="range"
                min={amountStats.min}
                max={amountStats.max}
                value={amountRange[0]}
                onChange={(e) =>
                  setAmountRange(([_, max]) => [
                    Math.min(Number(e.target.value), max - 1),
                    max,
                  ])
                }
                className="w-full accent-primary-500 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-secondary-200 dark:[&::-webkit-slider-runnable-track]:bg-secondary-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
              />
              <input
                type="range"
                min={amountStats.min}
                max={amountStats.max}
                value={amountRange[1]}
                onChange={(e) =>
                  setAmountRange(([min]) => [
                    min,
                    Math.max(Number(e.target.value), min + 1),
                  ])
                }
                className="w-full accent-primary-500 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-secondary-200 dark:[&::-webkit-slider-runnable-track]:bg-secondary-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={chartCardClasses}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Customer-wise Contribution
              </p>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                {formatCurrency(customerTotals)} total value
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCustomerChartType("pie")}
                className={`px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 ${
                  customerChartType === "pie"
                    ? "bg-primary-600 text-white"
                    : "border border-secondary-200 text-secondary-700"
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                Pie
              </button>
              <button
                onClick={() => setCustomerChartType("donut")}
                className={`px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 ${
                  customerChartType === "donut"
                    ? "bg-primary-600 text-white"
                    : "border border-secondary-200 text-secondary-700"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Donut
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-secondary-500">
            <button
              onClick={() => handleExport("customers", "png")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary-200"
            >
              <Download className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              onClick={() => handleExport("customers", "pdf")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary-200"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={() => handleExport("customers", "csv")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary-200"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>

          <div ref={customerChartRef} className="relative h-[360px] flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full rounded-2xl bg-secondary-100 animate-pulse" />
            ) : filteredCustomers.length === 0 ? (
              <div className="text-secondary-500 text-center">No customer data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="shadow" height="130%">
                      <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="rgba(15,23,42,0.25)" />
                    </filter>
                  </defs>
                  <Pie
                    data={filteredCustomers}
                    dataKey="amount"
                    nameKey="customer"
                    innerRadius={customerChartType === "donut" ? 60 : 0}
                    outerRadius={140}
                    paddingAngle={2}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    stroke="none"
                    labelLine={false}
                    filter="url(#shadow)"
                    label={false}
                  >
                    {filteredCustomers.map((entry, index) => (
                      <Cell
                        key={entry.id}
                        fill={colors[index % colors.length]}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            {!loading &&
              filteredCustomers.length > 0 &&
              activeIndex != null &&
              filteredCustomers[activeIndex] && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="rounded-2xl bg-white/90 dark:bg-secondary-900/90 px-4 py-3 text-center shadow-lg border border-secondary-100/80 dark:border-secondary-800/60 min-w-[180px]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                      {(
                        (filteredCustomers[activeIndex].amount / customerTotals) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-base font-semibold text-secondary-900 dark:text-white">
                      {filteredCustomers[activeIndex].customer}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      {formatCurrency(filteredCustomers[activeIndex].amount)}
                    </p>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className={chartCardClasses}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                Tax Breakup & Compliance
              </p>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
                {formatCurrency(
                  filteredTax.reduce((acc, curr) => acc + curr.value, 0)
                )}{" "}
                total tax
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaxOrientation("column")}
                className={`px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 ${
                  taxOrientation === "column"
                    ? "bg-primary-600 text-white"
                    : "border border-secondary-200 text-secondary-700"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Column
              </button>
              <button
                onClick={() => setTaxOrientation("bar")}
                className={`px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center gap-1 ${
                  taxOrientation === "bar"
                    ? "bg-primary-600 text-white"
                    : "border border-secondary-200 text-secondary-700"
                }`}
              >
                <Rows className="w-3.5 h-3.5" />
                Bar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-secondary-500">
            <button
              onClick={() => handleExport("tax", "png")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary-200"
            >
              <Download className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              onClick={() => handleExport("tax", "pdf")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary-200"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={() => handleExport("tax", "csv")}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-secondary-200"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>

          <div ref={taxChartRef} className="relative h-[360px]">
            {loading ? (
              <div className="w-full h-full rounded-2xl bg-secondary-100 animate-pulse" />
            ) : filteredTax.length === 0 ? (
              <div className="text-secondary-500 text-center">No tax data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredTax}
                  layout={isBarLayout ? "vertical" : "horizontal"}
                  margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="taxGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                  <XAxis
                    type={isBarLayout ? "number" : "category"}
                    dataKey={isBarLayout ? undefined : "name"}
                    tickFormatter={isBarLayout ? formatCurrency : undefined}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type={isBarLayout ? "category" : "number"}
                    dataKey={isBarLayout ? "name" : undefined}
                    tickFormatter={isBarLayout ? undefined : formatCurrency}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid rgba(148,163,184,0.3)",
                      background: "rgba(15,23,42,0.9)",
                      color: "white",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    radius={[12, 12, 12, 12]}
                    fill="url(#taxGradient)"
                    animationDuration={700}
                  >
                    {filteredTax.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                  <Brush
                    height={20}
                    stroke="#4F46E5"
                    dataKey="name"
                    travellerWidth={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

