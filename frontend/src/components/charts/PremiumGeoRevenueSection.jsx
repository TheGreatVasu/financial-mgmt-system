import { useEffect, useMemo, useRef, useState } from "react";
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
} from "recharts";
import {
  Filter,
  Maximize2,
  Minimize2,
  Download,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { toPng } from "html-to-image";
import clsx from "clsx";

const inputClass =
  "w-full h-12 rounded-2xl border border-secondary-200/70 dark:border-secondary-700 bg-white dark:bg-secondary-900/60 px-4 pr-10 text-sm font-medium text-secondary-800 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none modern-select";

const rangeClass =
  "w-full accent-primary-500 dark:accent-primary-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-secondary-200 dark:[&::-webkit-slider-runnable-track]:bg-secondary-700 h-1.5";

const defaultViewport = (length) => [
  0,
  Math.max(0, Math.min(9, Math.max(0, length - 1))),
];

const sortOptions = [
  { label: "Amount: High → Low", value: "desc" },
  { label: "Amount: Low → High", value: "asc" },
];

const limitOptions = [
  { label: "Top 10", value: "top10" },
  { label: "Top 20", value: "top20" },
  { label: "All", value: "all" },
];

const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const buildCsv = (rows = [], headers = []) => {
  const headerRow = headers.join(",");
  const body = rows
    .map((row) =>
      headers
        .map((key) => JSON.stringify(row[key] ?? "", (_, val) => val))
        .join(",")
    )
    .join("\n");
  return `${headerRow}\n${body}`;
};

export default function PremiumGeoRevenueSection({
  regionData = [],
  businessUnitData = [],
  loading = false,
}) {
  const normalizedRegion = useMemo(
    () =>
      regionData.map((item, index) => ({
        id: `${item.region || "region"}-${item.zone || "zone"}-${index}`,
        region: item.region || "Unknown Region",
        zone: item.zone || item.region || "Zone",
        amount: Number(item.amount || item.value || 0),
        date: item.date || item.period || item.month || item.createdAt || null,
        label: `${item.region || "Region"} • ${item.zone || "Zone"}`,
      })),
    [regionData]
  );

  const normalizedBusiness = useMemo(
    () =>
      businessUnitData.map((item, index) => ({
        id: `${item.businessUnit || "BU"}-${index}`,
        businessUnit: item.businessUnit || item.unit || "Business Unit",
        amount: Number(item.amount || item.revenue || item.value || 0),
        date: item.date || item.period || item.month || item.createdAt || null,
      })),
    [businessUnitData]
  );

  const amountStats = useMemo(() => {
    const amounts = [...normalizedRegion, ...normalizedBusiness]
      .map((d) => d.amount)
      .filter((v) => Number.isFinite(v));
    if (!amounts.length) return { min: 0, max: 0 };
    return {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    };
  }, [normalizedRegion, normalizedBusiness]);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    region: "all",
    zone: "all",
    businessUnit: "all",
    amountMin: amountStats.min,
    amountMax: amountStats.max,
    sort: "desc",
    limit: "top10",
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fullscreenChart, setFullscreenChart] = useState(null); // 'region' | 'business' | null
  const [legendFocus, setLegendFocus] = useState(null);
  const [regionViewport, setRegionViewport] = useState([0, 9]);
  const [businessViewport, setBusinessViewport] = useState([0, 9]);

  useEffect(() => {
    setFilters((prev) => {
      if (
        prev.amountMin === amountStats.min &&
        prev.amountMax === amountStats.max
      ) {
        return prev;
      }
      return {
        ...prev,
        amountMin: amountStats.min,
        amountMax: amountStats.max,
      };
    });
  }, [amountStats.min, amountStats.max]);

  const uniqueRegions = useMemo(
    () => Array.from(new Set(normalizedRegion.map((d) => d.region))).sort(),
    [normalizedRegion]
  );
  const uniqueZones = useMemo(
    () => Array.from(new Set(normalizedRegion.map((d) => d.zone))).sort(),
    [normalizedRegion]
  );
  const uniqueBusinessUnits = useMemo(
    () => Array.from(new Set(normalizedBusiness.map((d) => d.businessUnit))).sort(),
    [normalizedBusiness]
  );

  const applyFilters = (dataset, type) => {
    let result = [...dataset];

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      result = result.filter((item) => {
        if (!item.date) return true;
        return new Date(item.date) >= start;
      });
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      result = result.filter((item) => {
        if (!item.date) return true;
        return new Date(item.date) <= end;
      });
    }

    if (filters.region !== "all" && type === "region") {
      result = result.filter((item) => item.region === filters.region);
    }
    if (filters.zone !== "all" && type === "region") {
      result = result.filter((item) => item.zone === filters.zone);
    }
    if (filters.businessUnit !== "all" && type === "business") {
      result = result.filter(
        (item) => item.businessUnit === filters.businessUnit
      );
    }

    result = result.filter(
      (item) =>
        item.amount >= filters.amountMin && item.amount <= filters.amountMax
    );

    result.sort((a, b) =>
      filters.sort === "asc" ? a.amount - b.amount : b.amount - a.amount
    );

    if (filters.limit !== "all") {
      const sliceCount = filters.limit === "top10" ? 10 : 20;
      result = result.slice(0, sliceCount);
    }

    return result;
  };

  const filteredRegion = useMemo(
    () => applyFilters(normalizedRegion, "region"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalizedRegion, filters]
  );
  const filteredBusiness = useMemo(
    () => applyFilters(normalizedBusiness, "business"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalizedBusiness, filters]
  );

  useEffect(() => {
    if (filteredRegion.length) {
      setRegionViewport(defaultViewport(filteredRegion.length));
    }
    if (filteredBusiness.length) {
      setBusinessViewport(defaultViewport(filteredBusiness.length));
    }
  }, [
    filteredRegion.length,
    filteredBusiness.length,
    filters.region,
    filters.zone,
    filters.businessUnit,
    filters.limit,
    filters.sort,
  ]);

  const clampViewport = (viewport, dataLength) => {
    const [start, end] = viewport;
    if (start < 0) return [0, Math.max(0, Math.min(dataLength - 1, end - start))];
    if (end >= dataLength) {
      const size = end - start;
      return [Math.max(0, dataLength - size - 1), dataLength - 1];
    }
    return [start, end];
  };

  const handleWheelZoom = (chart, e, dataLength) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    if (chart === "region") {
      setRegionViewport((prev) => {
        const [start, end] = prev;
        const size = end - start + 1;
        if (delta > 0 && size >= dataLength) return prev;
        const zoomFactor = Math.max(1, Math.round(size * 0.1));
        let newStart = start + delta * zoomFactor;
        let newEnd = end - delta * zoomFactor;
        if (newEnd - newStart < 2) return prev;
        return clampViewport([newStart, newEnd], dataLength);
      });
    } else {
      setBusinessViewport((prev) => {
        const [start, end] = prev;
        const size = end - start + 1;
        if (delta > 0 && size >= dataLength) return prev;
        const zoomFactor = Math.max(1, Math.round(size * 0.1));
        let newStart = start + delta * zoomFactor;
        let newEnd = end - delta * zoomFactor;
        if (newEnd - newStart < 2) return prev;
        return clampViewport([newStart, newEnd], dataLength);
      });
    }
  };

  const handlePan = (chart, direction, dataLength) => {
    const shift = direction === "left" ? -1 : 1;
    if (chart === "region") {
      setRegionViewport((prev) =>
        clampViewport([prev[0] + shift, prev[1] + shift], dataLength)
      );
    } else {
      setBusinessViewport((prev) =>
        clampViewport([prev[0] + shift, prev[1] + shift], dataLength)
      );
    }
  };

  const handleZoomButton = (chart, type, dataLength) => {
    const delta = type === "in" ? 1 : -1;
    const adjust = (prev) => {
      const [start, end] = prev;
      const size = end - start + 1;
      const change = Math.max(1, Math.round(size * 0.15));
      let newStart = start + delta * change;
      let newEnd = end - delta * change;
      if (newEnd <= newStart) {
        return prev;
      }
      return clampViewport([newStart, newEnd], dataLength);
    };
    if (chart === "region") {
      setRegionViewport(adjust);
    } else {
      setBusinessViewport(adjust);
    }
  };

  const exportCsvData = (rows, filename, headers) => {
    const csv = buildCsv(rows, headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = async (ref, filename) => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "transparent",
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const ChartCard = ({
    id,
    title,
    subtitle,
    data,
    color,
    labelKey,
    dataKey,
    viewport,
    setViewport,
  }) => {
    const chartRef = useRef(null);
    const dataLength = data.length;
    const [startIndex, endIndex] = clampViewport(
      viewport,
      Math.max(dataLength, 1)
    );
    const visible = data.slice(startIndex, endIndex + 1);

    const skeleton = (
      <div className="animate-pulse h-[340px] rounded-2xl bg-gradient-to-b from-secondary-100/80 to-white/30 dark:from-secondary-800/60 dark:to-secondary-900/40" />
    );

    return (
      <div
        className={clsx(
          "rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0f172a] shadow-lg shadow-secondary-500/10 dark:shadow-black/30 p-4 sm:p-6 relative overflow-hidden transition-all",
          legendFocus && legendFocus !== dataKey ? "opacity-70" : "opacity-100"
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                {subtitle}
              </p>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                {title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  exportCsvData(
                    data,
                    `${id}-dataset.csv`,
                    Object.keys(data[0] || {})
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 px-3 py-1.5 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => exportPng(chartRef, `${id}-chart.png`)}
                className="inline-flex items-center gap-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 px-3 py-1.5 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
              >
                <Download className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={() =>
                  setFullscreenChart((prev) => (prev === id ? null : id))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 px-3 py-1.5 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800/50"
              >
                {fullscreenChart === id ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    Exit
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    Fullscreen
                  </>
                )}
              </button>
            </div>
          </div>

          {loading ? (
            skeleton
          ) : dataLength === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-secondary-500 dark:text-secondary-400">
              No data available for the selected filters.
            </div>
          ) : (
            <div
              ref={chartRef}
              className="relative"
              onWheel={(e) => handleWheelZoom(id, e, dataLength)}
              role="presentation"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                <div className="flex items-center gap-1">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>
                    Viewing {startIndex + 1}–{Math.min(endIndex + 1, dataLength)}{" "}
                    of {dataLength}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePan(id, "left", dataLength)}
                    className="px-2 py-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/40"
                    aria-label="Pan left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handlePan(id, "right", dataLength)}
                    className="px-2 py-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/40"
                    aria-label="Pan right"
                  >
                    →
                  </button>
                  <button
                    onClick={() => handleZoomButton(id, "in", dataLength)}
                    className="px-2 py-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/40"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleZoomButton(id, "out", dataLength)}
                    className="px-2 py-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/40"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setViewport(defaultViewport(dataLength))
                    }
                    className="px-2 py-1 rounded-lg border border-secondary-200/70 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800/40"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={visible}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  onDoubleClick={() =>
                    setViewport(defaultViewport(dataLength))
                  }
                >
                  <defs>
                    <linearGradient
                      id={`${id}-gradient`}
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={color[0]} stopOpacity={0.9} />
                      <stop offset="85%" stopColor={color[1]} stopOpacity={0.7} />
                      <stop offset="100%" stopColor={color[1]} stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.35)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey={labelKey}
                    tick={{ fontSize: 12, fill: "currentColor" }}
                    axisLine={false}
                    tickLine={false}
                    height={60}
                    tickFormatter={(value) =>
                      value.length > 10 ? `${value.slice(0, 10)}…` : value
                    }
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "currentColor" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(148, 163, 184, 0.3)",
                      background:
                        "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))",
                      color: "white",
                    }}
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => label}
                  />
                  <Legend
                    onMouseEnter={() => setLegendFocus(dataKey)}
                    onMouseLeave={() => setLegendFocus(null)}
                    wrapperStyle={{
                      paddingTop: 12,
                    }}
                  />
                  <Bar
                    dataKey={dataKey}
                    name="Invoice Amount"
                    fill={`url(#${id}-gradient)`}
                    radius={[12, 12, 12, 12]}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <Brush
                    dataKey={labelKey}
                    height={24}
                    stroke={color[0]}
                    travellerWidth={12}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onChange={(range) => {
                      if (range?.startIndex != null && range?.endIndex != null) {
                        setViewport([range.startIndex, range.endIndex]);
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  const fullscreenContent =
    fullscreenChart === null ? null : fullscreenChart === "region" ? (
      <ChartCard
        id="region"
        title="Region / Zone-wise Invoice Amount"
        subtitle="Interactive revenue heatmap by region and zone"
        data={filteredRegion}
        color={["#2563eb", "#60a5fa"]}
        labelKey="label"
        dataKey="amount"
        viewport={regionViewport}
        setViewport={setRegionViewport}
      />
    ) : (
      <ChartCard
        id="business"
        title="Business Unit-wise Revenue"
        subtitle="Performance by business unit"
        data={filteredBusiness.map((item) => ({
          ...item,
          label: item.businessUnit,
        }))}
        color={["#059669", "#34d399"]}
        labelKey="label"
        dataKey="amount"
        viewport={businessViewport}
        setViewport={setBusinessViewport}
      />
    );

  return (
    <>
      <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0b1220] shadow-xl shadow-secondary-500/10 dark:shadow-black/50 p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-secondary-400 dark:text-secondary-500 font-semibold">
              Geo & Business Insights
            </p>
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Advanced Analytics Controls
            </h2>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl border border-secondary-200/70 dark:border-secondary-700 px-4 py-2 text-sm font-semibold text-secondary-700 dark:text-secondary-100 hover:bg-secondary-50 dark:hover:bg-secondary-800/40 transition"
            onClick={() => setFiltersOpen((prev) => !prev)}
          >
            <Filter className="w-4 h-4" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div
          className={clsx(
            "grid gap-4 transition-all",
            filtersOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-70 lg:grid-rows-[1fr]"
          )}
        >
          <div
            className={clsx(
              "rounded-3xl border border-secondary-100 dark:border-secondary-800/70 bg-secondary-50/40 dark:bg-secondary-900/20 p-4 sm:p-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
              filtersOpen
                ? "max-h-[660px] overflow-visible"
                : "max-h-[0] overflow-hidden lg:max-h-full lg:overflow-visible"
            )}
          >
            <FilterField label="Date Range" className="col-span-1">
              <ModernDateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={({ startDate, endDate }) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate,
                    endDate,
                  }))
                }
              />
            </FilterField>

            <FilterField label="Region">
              <div className="relative">
                <select
                  className={inputClass}
                  value={filters.region}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, region: e.target.value }))
                  }
                >
                  <option value="all">All regions</option>
                  {uniqueRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              </div>
            </FilterField>

            <FilterField label="Zone">
              <div className="relative">
                <select
                  className={inputClass}
                  value={filters.zone}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, zone: e.target.value }))
                  }
                >
                  <option value="all">All zones</option>
                  {uniqueZones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              </div>
            </FilterField>

            <FilterField label="Business Unit">
              <div className="relative">
                <select
                  className={inputClass}
                  value={filters.businessUnit}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      businessUnit: e.target.value,
                    }))
                  }
                >
                  <option value="all">All units</option>
                  {uniqueBusinessUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              </div>
            </FilterField>

            <FilterField
              label="Amount Range"
              className="md:col-span-2 2xl:col-span-2"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
                  <span className="text-secondary-700 dark:text-secondary-200">
                    Min | {formatCurrency(filters.amountMin)}
                  </span>
                  <span className="text-secondary-700 dark:text-secondary-200">
                    Max | {formatCurrency(filters.amountMax)}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    type="range"
                    min={amountStats.min}
                    max={amountStats.max}
                    value={filters.amountMin}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        amountMin: Math.min(
                          Number(e.target.value),
                          prev.amountMax - 1
                        ),
                      }))
                    }
                    className={rangeClass}
                  />
                  <input
                    type="range"
                    min={amountStats.min}
                    max={amountStats.max}
                    value={filters.amountMax}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        amountMax: Math.max(
                          Number(e.target.value),
                          prev.amountMin + 1
                        ),
                      }))
                    }
                    className={rangeClass}
                  />
                </div>
              </div>
            </FilterField>

            <FilterField label="Sorting">
              <div className="relative">
                <select
                  className={inputClass}
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sort: e.target.value }))
                  }
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              </div>
            </FilterField>

            <FilterField label="Slice">
              <div className="relative">
                <select
                  className={inputClass}
                  value={filters.limit}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, limit: e.target.value }))
                  }
                >
                  {limitOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
              </div>
            </FilterField>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ChartCard
            id="region"
            title="Region / Zone-wise Invoice Amount"
            subtitle="Interactive revenue heatmap by region and zone"
            data={filteredRegion}
            color={["#2563eb", "#60a5fa"]}
            labelKey="label"
            dataKey="amount"
            viewport={regionViewport}
            setViewport={setRegionViewport}
          />

          <ChartCard
            id="business"
            title="Business Unit-wise Revenue"
            subtitle="Performance by business unit"
            data={filteredBusiness.map((item) => ({
              ...item,
              label: item.businessUnit,
            }))}
            color={["#059669", "#34d399"]}
            labelKey="label"
            dataKey="amount"
            viewport={businessViewport}
            setViewport={setBusinessViewport}
          />
        </div>
      </div>

      {fullscreenChart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[85vh] overflow-auto rounded-3xl bg-[#020617] border border-secondary-800/70 shadow-2xl shadow-black/70 p-6">
            <div className="flex justify-between items-center text-white mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <p className="text-lg font-semibold">Fullscreen view</p>
              </div>
              <button
                onClick={() => setFullscreenChart(null)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-4 py-2 text-sm hover:bg-white/10"
              >
                <Minimize2 className="w-4 h-4" />
                Exit fullscreen
              </button>
            </div>
            {fullscreenContent}
          </div>
        </div>
      )}
    </>
  );
}

function ModernDateRangePicker({ startDate, endDate, onChange }) {
  const appliedStart = startDate ? parseISO(startDate) : null;
  const appliedEnd = endDate ? parseISO(endDate) : null;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    appliedStart || new Date()
  );
  const [draftRange, setDraftRange] = useState({
    start: appliedStart,
    end: appliedEnd,
  });
  const pickerRef = useRef(null);
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    setDraftRange({
      start: appliedStart,
      end: appliedEnd,
    });
  }, [appliedStart, appliedEnd]);

  useEffect(() => {
    if (appliedStart) {
      setVisibleMonth(appliedStart);
    }
  }, [appliedStart]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const finalizeRange = (start, end) => {
    onChange({
      startDate: start ? format(start, "yyyy-MM-dd") : "",
      endDate: end ? format(end, "yyyy-MM-dd") : "",
    });
    setOpen(false);
  };

  const handleDayClick = (day) => {
    if (!draftRange.start || (draftRange.start && draftRange.end)) {
      setDraftRange({ start: day, end: null });
      return;
    }
    if (isBefore(day, draftRange.start)) {
      setDraftRange({ start: day, end: draftRange.start });
      finalizeRange(day, draftRange.start);
    } else {
      setDraftRange({ start: draftRange.start, end: day });
      finalizeRange(draftRange.start, day);
    }
  };

  const handleClear = () => {
    setDraftRange({ start: null, end: null });
    finalizeRange(null, null);
  };

  const renderMonth = (monthDate) => {
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }),
    });

    return (
      <div
        key={monthDate.toISOString()}
        className="space-y-3 rounded-2xl border border-secondary-100/80 bg-secondary-50/40 p-4 dark:border-secondary-800/70 dark:bg-secondary-900/40"
      >
        <p className="text-sm font-semibold text-secondary-700 dark:text-secondary-200">
          {format(monthDate, "MMMM yyyy")}
        </p>
        <div className="grid grid-cols-7 gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-secondary-400">
          {weekDays.map((day) => (
            <span key={day} className="text-center">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const isEdge =
              (draftRange.start && isSameDay(day, draftRange.start)) ||
              (draftRange.end && isSameDay(day, draftRange.end));
            const isBetween =
              draftRange.start &&
              draftRange.end &&
              isWithinInterval(day, {
                start: draftRange.start,
                end: draftRange.end,
              });
            const isMuted = !isSameMonth(day, monthDate);
            return (
              <button
                type="button"
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={clsx(
                  "aspect-square w-full rounded-xl text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                  isEdge
                    ? "bg-primary-600 text-white"
                    : isBetween
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100"
                      : "text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800/60",
                  isMuted && "text-secondary-400/80"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const displayValue =
    appliedStart && appliedEnd
      ? `${format(appliedStart, "dd MMM yyyy")} - ${format(
          appliedEnd,
          "dd MMM yyyy"
        )}`
      : "dd-mm-yyyy";

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-secondary-200/70 dark:border-secondary-700 bg-white dark:bg-secondary-900/60 px-4 py-3 text-left shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-50 dark:bg-primary-900/30 p-2">
            <CalendarDays className="h-4 w-4 text-primary-600 dark:text-primary-300" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary-400">
              Invoice date range
            </p>
            <p className="text-sm font-medium text-secondary-800 dark:text-secondary-100">
              {displayValue}
            </p>
          </div>
        </div>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-secondary-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-4 w-[560px] max-w-[90vw] -translate-x-1/2 rounded-3xl border border-secondary-200/80 bg-white/95 backdrop-blur-2xl p-5 shadow-2xl dark:border-secondary-700 dark:bg-secondary-900/95">
          <div className="flex items-center justify-between text-secondary-700 dark:text-secondary-200">
            <button
              type="button"
              onClick={() => setVisibleMonth((prev) => subMonths(prev, 1))}
              className="rounded-2xl border border-secondary-200/70 p-2.5 hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800/60 transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold">
              {format(visibleMonth, "MMMM yyyy")} /
              {" "}
              {format(addMonths(visibleMonth, 1), "MMMM yyyy")}
            </p>
            <button
              type="button"
              onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
              className="rounded-2xl border border-secondary-200/70 p-2.5 hover:bg-secondary-50 dark:border-secondary-700 dark:hover:bg-secondary-800/60 transition"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {renderMonth(visibleMonth)}
            {renderMonth(addMonths(visibleMonth, 1))}
          </div>
          <div className="mt-5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary-500 dark:text-secondary-400">
            <button
              type="button"
              onClick={handleClear}
              className="text-danger-600 hover:text-danger-500"
            >
              Clear
            </button>
            <span>
              {draftRange.start && !draftRange.end
                ? "Select end date"
                : "Pick two dates to apply"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children, className = "" }) {
  return (
    <div className={clsx("space-y-2 min-w-0", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
        {label}
      </p>
      {children}
    </div>
  );
}


