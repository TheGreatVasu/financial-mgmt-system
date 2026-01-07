import { useEffect, useState, useCallback } from "react";
import { RefreshCw, TrendingUp, DollarSign, Receipt, AlertTriangle, Package, FileText, Trash2, Download, ClipboardList } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { useImportContext } from "../../context/ImportContext.jsx";
import { getSalesInvoiceDashboard } from "../../services/salesInvoiceService.js";
import { initializeSocket } from "../../services/socketService.js";
import { createApiClient } from "../../services/apiClient.js";
import SalesInvoiceMasterTable from "../tables/SalesInvoiceMasterTable.jsx";
import { 
  PremiumGeoRevenueSection, 
  AdvancedRevenueCharts, 
  MonthlyInvoiceTrendChart, 
  DeductionComparisonChart 
} from "../charts";
import UploadQueueButton from "../dashboard/UploadQueueButton.jsx";
import toast from "react-hot-toast";

// Removed DASHBOARD_CLEAR_KEY - no longer using cleared state

const createEmptyDashboard = () => ({
  hasData: true,
  isPlaceholder: true,
  summary: {
    totalInvoiceAmount: 0,
    totalTax: 0,
    totalDeductions: 0,
    totalPenaltyLD: 0,
    freight: 0,
    insurance: 0,
    badDebts: 0,
    netReceivables: 0,
  },
  invoices: [],
  regionWise: [],
  businessUnitWise: [],
  customerWise: [],
  taxBreakup: [],
  monthlyTrends: [],
  deductionComparison: [],
  reconciliation: {
    excessQty: 0,
    lcDiscrepancy: 0,
    bankCharges: 0,
    interest: 0,
    shortage: 0,
    otherExceptions: [],
  },
});

export default function SalesInvoiceDashboard() {
  const { token } = useAuthContext();
  const { refreshTrigger } = useImportContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [showExceptionDetails, setShowExceptionDetails] = useState(true);

  // Removed isCleared state - always show live data

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      setError(null);
      if (showLoading) {
        setLoading(true);
      }
      const response = await getSalesInvoiceDashboard(token);
      if (response.success) {
        const data = response.data || {};
        const hasInvoices = data.invoices && data.invoices.length > 0;
        const hasAmount = data.summary && parseFloat(data.summary.totalInvoiceAmount || 0) > 0;
        const hasDataFlag = data.hasData === true;
        
        // Check if we have actual data - either hasData flag is true OR we have invoices/amounts
        if (hasDataFlag || hasInvoices || hasAmount) {
          setDashboardData({ ...data, isPlaceholder: false });
        } else {
          setDashboardData(createEmptyDashboard());
        }
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      // Only show toast on initial load, not on refresh
      if (showLoading) {
        toast.error(err.message || 'Failed to load dashboard data');
      }
      // Set empty dashboard on error so UI doesn't break
      setDashboardData(createEmptyDashboard());
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);


  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchDashboardData(true);
  }, [token, fetchDashboardData]);

  // Auto-refresh when import completes (refreshTrigger changes)
  useEffect(() => {
    if (token && refreshTrigger > 0) {
      setIsRefreshing(true);
      const timer = setTimeout(() => {
        fetchDashboardData(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [refreshTrigger, token, fetchDashboardData]);


  // Set up real-time socket updates
  useEffect(() => {
  if (!token) return;

  const socket = initializeSocket(token);

  if (!socket) {
    console.warn('Socket not available - using polling only');
    fetchDashboardData(false);
    return;
  }

  const handleDashboardUpdate = (data) => {
    if (data && data.success && data.data) {
      setDashboardData({ ...data.data, isPlaceholder: false });
      setIsRefreshing(false);
      toast.success('Dashboard updated with latest data', { duration: 3000 });
    }
  };

  socket.on('sales-invoice-dashboard:update', handleDashboardUpdate);

  return () => {
    socket.off('sales-invoice-dashboard:update', handleDashboardUpdate);
  };
}, [token, fetchDashboardData]);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData(false);
    toast.success('Dashboard refreshed', { duration: 2000 });
  };

  const handleDeleteAllData = async () => {
    if (!window.confirm('Are you sure you want to delete ALL invoice data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsRefreshing(true);
      const api = createApiClient(token);
      const response = await api.delete('/dashboard/sales-invoice/delete-all');
      
      if (response.data?.success) {
        toast.success(`All invoice data deleted successfully (${response.data.deletedCount || 0} records)`, { duration: 3000 });
        // Refresh dashboard to show empty state
        setLoading(true);
        await fetchDashboardData(true);
      } else {
        throw new Error(response.data?.message || 'Failed to delete data');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          {/* Header skeleton */}
          <div className="h-16 sm:h-20 bg-secondary-200 rounded-xl sm:rounded-2xl"></div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 sm:h-32 bg-secondary-200 rounded-xl sm:rounded-2xl"></div>
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 sm:h-80 bg-secondary-200 rounded-xl sm:rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-danger-200 bg-danger-50 p-6 sm:p-8 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-danger-600 mx-auto mb-3 sm:mb-4 animate-pulse" />
        <h3 className="text-base sm:text-lg font-semibold text-danger-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-sm sm:text-base text-danger-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-6 sm:p-8 md:p-12 text-center shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-secondary-400 mx-auto mb-3 sm:mb-4 animate-pulse-slow" />
        <h3 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-2">Preparing Your Dashboard</h3>
        <p className="text-sm sm:text-base text-secondary-600 mb-4 sm:mb-6">
          Please wait while we set up a fresh workspace for your invoice analytics.
        </p>
      </div>
    );
  }
  
  
  const { summary, invoices, regionWise, businessUnitWise, customerWise, taxBreakup, monthlyTrends, deductionComparison, reconciliation } = dashboardData;
  const isPlaceholderDashboard = dashboardData.isPlaceholder;
  const exceptionRows = reconciliation?.otherExceptions || [];

  const exportExceptionCsv = () => {
    if (!exceptionRows.length) return;
    const headers = ['Invoice', 'Hold', 'Amount'];
    const body = exceptionRows
      .map((item) =>
        [item.invoiceNo, item.hold, item.amount].map((value) => JSON.stringify(value ?? '')).join(',')
      )
      .join('\n');
    const blob = new Blob([`${headers.join(',')}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reconciliation-exceptions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="animate-in fade-in-0 slide-in-from-left-4 duration-500">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary-900 tracking-tight">Sales Invoice Dashboard</h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-1">
            Comprehensive analytics and insights from your invoice data
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <UploadQueueButton />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base animate-in fade-in-0 slide-in-from-right-4 duration-500"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {isPlaceholderDashboard && (
        <div className="rounded-xl border border-dashed border-secondary-300 bg-secondary-50 text-secondary-700 px-4 py-3 text-sm flex items-center justify-between flex-wrap gap-3">
          <span>Fresh workspace ready. Import your first file or keep exploring with zeroed metrics until data arrives.</span>
          <button
            onClick={handleDeleteAllData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Delete all invoice data"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete All Data</span>
          </button>
        </div>
      )}

      {!isPlaceholderDashboard && dashboardData && dashboardData.invoices && dashboardData.invoices.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={handleDeleteAllData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            title="Delete all invoice data"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Data</span>
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Invoice Amount</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors duration-300">{formatCurrency(summary.totalInvoiceAmount)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Tax</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-purple-600 transition-colors duration-300">{formatCurrency(summary.totalTax)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-orange-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Total Deductions</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-orange-600 transition-colors duration-300">{formatCurrency(summary.totalDeductions)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-red-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Penalty / LD</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-red-600 transition-colors duration-300">{formatCurrency(summary.totalPenaltyLD)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Freight</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-indigo-600 transition-colors duration-300">{formatCurrency(summary.freight)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-teal-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Insurance</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-teal-600 transition-colors duration-300">{formatCurrency(summary.insurance)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-rose-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Bad Debts</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-rose-600 transition-colors duration-300">{formatCurrency(summary.badDebts)}</p>
        </div>

        <div className="group rounded-xl sm:rounded-2xl border border-secondary-200/70 bg-white p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/50 animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '450ms' }}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-secondary-600 mb-1">Net Receivables</h3>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 group-hover:text-emerald-600 transition-colors duration-300">{formatCurrency(summary.netReceivables)}</p>
        </div>
      </div>

      <PremiumGeoRevenueSection
        regionData={regionWise}
        businessUnitData={businessUnitWise}
        loading={loading && !regionWise?.length}
      />

      <AdvancedRevenueCharts
        customerData={customerWise}
        taxData={taxBreakup}
        loading={loading && !customerWise?.length}
      />

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MonthlyInvoiceTrendChart data={monthlyTrends} />
        <DeductionComparisonChart data={deductionComparison} />
      </div>

      {/* Reconciliation Insights */}
      <div className="rounded-3xl border border-secondary-200/70 dark:border-secondary-800/60 bg-white dark:bg-[#0b1220] p-4 sm:p-6 shadow-xl shadow-secondary-500/10 dark:shadow-black/60 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
              Reconciliation Insights
            </p>
            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
              Exceptions & adjustments overview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportExceptionCsv}
              disabled={!exceptionRows.length}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-secondary-200 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export Exceptions
            </button>
            <button
              onClick={() => setShowExceptionDetails((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-secondary-200 text-sm font-semibold text-secondary-700 hover:bg-secondary-50"
            >
              <ClipboardList className="w-4 h-4" />
              {showExceptionDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: 'Excess Supply Qty',
              value: parseFloat(reconciliation.excessQty || 0).toLocaleString('en-IN'),
              footprint: 'Units reported vs plan',
              accent: 'from-orange-500/10 to-orange-500/5 text-orange-600'
            },
            {
              label: 'LC Discrepancy Charge',
              value: formatCurrency(reconciliation.lcDiscrepancy),
              footprint: 'Banking related holds',
              accent: 'from-rose-500/10 to-rose-500/5 text-rose-600'
            },
            {
              label: 'Bank Charges',
              value: formatCurrency(reconciliation.bankCharges),
              footprint: 'Financing & FX adjustments',
              accent: 'from-purple-500/10 to-purple-500/5 text-purple-600'
            },
            {
              label: 'Interest on Advance',
              value: formatCurrency(reconciliation.interest),
              footprint: 'Interest accrual impact',
              accent: 'from-blue-500/10 to-blue-500/5 text-blue-600'
            },
            {
              label: 'Shortage',
              value: formatCurrency(reconciliation.shortage),
              footprint: 'Quantity gaps',
              accent: 'from-amber-500/10 to-amber-500/5 text-amber-600'
            }
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border border-secondary-100/80 bg-gradient-to-br ${item.accent} p-4 shadow-sm`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-1">
                {item.label}
              </p>
              <p className="text-xl font-bold text-secondary-900 dark:text-white">{item.value}</p>
              <p className="text-[11px] text-secondary-500 mt-1">{item.footprint}</p>
            </div>
          ))}
        </div>
        {showExceptionDetails && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                  Exception Details
                </p>
                <p className="text-xs text-secondary-500">
                  {exceptionRows.length || 0} invoice(s) currently on hold
                </p>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
              {exceptionRows.length === 0 ? (
                <div className="p-4 rounded-2xl border border-secondary-100 text-secondary-500 text-sm">
                  No open reconciliation exceptions.
                </div>
              ) : (
                exceptionRows.slice(0, 8).map((exception, idx) => (
                  <div
                    key={`${exception.invoiceNo}-${idx}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-secondary-100 bg-secondary-50/60 px-4 py-3 text-sm"
                  >
                    <div className="font-semibold text-secondary-900">
                      #{exception.invoiceNo}
                    </div>
                    <div className="flex-1 min-w-[180px] text-secondary-600">
                      {exception.hold}
                    </div>
                    <div className="font-semibold text-rose-600">
                      {formatCurrency(exception.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Master Table */}
      <SalesInvoiceMasterTable invoices={invoices} loading={loading} />
    </div>
  );
}

