import { useEffect, useState, useCallback } from "react";
import { RefreshCw, TrendingUp, DollarSign, Receipt, AlertTriangle, Package, FileText, BarChart3 } from "lucide-react";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { useImportContext } from "../../context/ImportContext.jsx";
import { getSalesInvoiceDashboard } from "../../services/salesInvoiceService.js";
import { initializeSocket, getSocket } from "../../services/socketService.js";
import SalesInvoiceMasterTable from "../tables/SalesInvoiceMasterTable.jsx";
import SalesInvoiceFilterPanel from "../filters/SalesInvoiceFilterPanel.jsx";
import RegionZoneChart from "../charts/RegionZoneChart.jsx";
import BusinessUnitChart from "../charts/BusinessUnitChart.jsx";
import CustomerContributionChart from "../charts/CustomerContributionChart.jsx";
import TaxBreakupChart from "../charts/TaxBreakupChart.jsx";
import MonthlyInvoiceTrendChart from "../charts/MonthlyInvoiceTrendChart.jsx";
import DeductionComparisonChart from "../charts/DeductionComparisonChart.jsx";
import toast from "react-hot-toast";

export default function SalesInvoiceDashboard() {
  const { token } = useAuthContext();
  const { refreshTrigger } = useImportContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [filterDebounceTimer, setFilterDebounceTimer] = useState(null);

  const fetchDashboardData = useCallback(async (currentFilters = filters) => {
    try {
      setError(null);
      console.log('📊 Fetching dashboard data with filters:', currentFilters);
      const response = await getSalesInvoiceDashboard(token, currentFilters);
      console.log('📊 Dashboard data received:', {
        success: response.success,
        hasData: response.data?.hasData,
        invoiceCount: response.data?.invoices?.length || 0
      });
      if (response.success) {
        setDashboardData(response.data);
        console.log('✅ Dashboard data updated in state');
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
      toast.error(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  // Handle filter changes with debounce
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Clear existing timer
    if (filterDebounceTimer) {
      clearTimeout(filterDebounceTimer);
    }
    // Set loading state immediately for better UX
    setIsRefreshing(true);
    // Debounce API call
    const timer = setTimeout(() => {
      fetchDashboardData(newFilters);
    }, 300); // 300ms debounce
    setFilterDebounceTimer(timer);
  }, [filterDebounceTimer, fetchDashboardData]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Auto-refresh when import completes (refreshTrigger changes)
  useEffect(() => {
    if (token && refreshTrigger > 0) {
      console.log('🔄 Dashboard refresh triggered by import:', { refreshTrigger });
      setIsRefreshing(true);
      // Small delay to ensure database has updated
      const timer = setTimeout(() => {
        console.log('🔄 Fetching dashboard data after import...');
        fetchDashboardData();
      }, 1500); // Slightly longer delay to ensure DB commit
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, token]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (filterDebounceTimer) {
        clearTimeout(filterDebounceTimer);
      }
    };
  }, [filterDebounceTimer]);

  // Set up real-time socket updates
  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    const socket = initializeSocket(token);

    // Listen for sales invoice dashboard updates
    const handleDashboardUpdate = (data) => {
      if (data && data.success && data.data) {
        console.log('🔄 Real-time dashboard update received');
        setDashboardData(data.data);
        toast.success('Dashboard updated with latest data', { duration: 3000 });
      }
    };

    socket.on('sales-invoice-dashboard:update', handleDashboardUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('sales-invoice-dashboard:update', handleDashboardUpdate);
    };
  }, [token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
  };

  const formatCurrency = (value) => {
    return `₹${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="rounded-2xl border border-danger-200 bg-danger-50 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-danger-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-danger-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.hasData) {
    return (
      <div className="rounded-2xl border border-secondary-200 bg-white p-12 text-center shadow-soft">
        <FileText className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Invoice Data Available</h3>
        <p className="text-secondary-600 mb-6">
          Import your sales invoice Excel file to see dashboard analytics and insights.
        </p>
        <p className="text-sm text-secondary-500">
          Use the Import button in the header to upload your Sales_Invoice_Import_Format.xlsx file.
        </p>
      </div>
    );
  }

  const { summary, invoices, regionWise, businessUnitWise, customerWise, taxBreakup, monthlyTrends, deductionComparison, reconciliation, availableOptions } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Sales Invoice Dashboard</h1>
          <p className="text-sm text-secondary-600 mt-1">
            Comprehensive analytics and insights from your invoice data
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Panel */}
      <SalesInvoiceFilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableOptions={availableOptions || {}}
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Total Invoice Amount</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.totalInvoiceAmount)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Total Tax</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.totalTax)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Total Deductions</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.totalDeductions)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Penalty / LD</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.totalPenaltyLD)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Freight</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.freight)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Insurance</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.insurance)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Bad Debts</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.badDebts)}</p>
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-secondary-600 mb-1">Net Receivables</h3>
          <p className="text-2xl font-bold text-secondary-900">{formatCurrency(summary.netReceivables)}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Region / Zone-wise Invoice Amount</h3>
          <RegionZoneChart data={regionWise} />
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Business Unit-wise Revenue</h3>
          <BusinessUnitChart data={businessUnitWise} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Customer-wise Contribution</h3>
          <CustomerContributionChart data={customerWise} />
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Tax Breakup (CGST/SGST/IGST/UGST/TCS)</h3>
          <TaxBreakupChart data={taxBreakup} />
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Month-wise Invoice Trend</h3>
          <MonthlyInvoiceTrendChart data={monthlyTrends} />
        </div>

        <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Deduction vs Net Invoice Comparison</h3>
          <DeductionComparisonChart data={deductionComparison} />
        </div>
      </div>

      {/* Reconciliation Insights */}
      <div className="rounded-2xl border border-secondary-200/60 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Reconciliation Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <h4 className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">Excess Supply Qty</h4>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-400">
              {parseFloat(reconciliation.excessQty || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h4 className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">LC Discrepancy Charge</h4>
            <p className="text-xl font-bold text-red-700 dark:text-red-400">
              {formatCurrency(reconciliation.lcDiscrepancy)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">Bank Charges</h4>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
              {formatCurrency(reconciliation.bankCharges)}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Interest on Advance</h4>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {formatCurrency(reconciliation.interest)}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-300 mb-1">Shortage</h4>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
              {formatCurrency(reconciliation.shortage)}
            </p>
          </div>
          {reconciliation.otherExceptions && reconciliation.otherExceptions.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-1">Other Exceptions</h4>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                {reconciliation.otherExceptions.length} invoice(s) with holds
              </p>
            </div>
          )}
        </div>
        {reconciliation.otherExceptions && reconciliation.otherExceptions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Exception Details:</h4>
            <div className="space-y-2">
              {reconciliation.otherExceptions.slice(0, 5).map((exception, idx) => (
                <div key={idx} className="p-3 bg-secondary-50 rounded-lg text-sm">
                  <span className="font-medium">{exception.invoiceNo}:</span> {exception.hold} - {formatCurrency(exception.amount)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Master Table */}
      <SalesInvoiceMasterTable invoices={invoices} loading={loading} />
    </div>
  );
}

