import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  getDatabaseStatus,
  runMigrations,
  rollbackMigrations,
  runSeeds,
  getTableStructure
} from '../../services/databaseService';
import {
  Database,
  RefreshCw,
  Play,
  RotateCcw,
  Seedling,
  Table,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Info,
  Server,
  HardDrive,
  FileText
} from 'lucide-react';

export default function DatabaseManagementPage() {
  const { user, token } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableStructure, setTableStructure] = useState(null);
  const [showTableDetails, setShowTableDetails] = useState(false);

  useEffect(() => {
    if (token) {
      loadStatus();
    }
  }, [token]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDatabaseStatus(token);
      setStatus(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load database status');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, actionFn) => {
    try {
      setActionLoading(action);
      setError(null);
      await actionFn(token);
      await loadStatus();
      // Show success message
      setTimeout(() => setActionLoading(null), 1000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action}`);
      setActionLoading(null);
    }
  };

  const handleViewTable = async (tableName) => {
    try {
      setActionLoading(`table-${tableName}`);
      const response = await getTableStructure(token, tableName);
      setTableStructure(response.data);
      setSelectedTable(tableName);
      setShowTableDetails(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load table structure');
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Access Denied
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This page is only accessible to administrators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Database className="h-8 w-8 text-primary-600" />
              Database Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage database migrations, seeds, and monitor database health
            </p>
          </div>
          <button
            onClick={loadStatus}
            disabled={loading || actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : status ? (
          <>
            {/* Database Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {status.database?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Version: {status.database?.version || 'N/A'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Table className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tables</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {status.stats?.totalTables || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {status.stats?.totalRows || 0} total rows
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Database Size</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {status.stats?.totalSizeMB?.toFixed(2) || '0.00'} MB
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Server time: {new Date(status.database?.serverTime).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Database Operations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleAction('migrate', runMigrations)}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'migrate' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                  <span>Run Migrations</span>
                </button>

                <button
                  onClick={() => handleAction('rollback', rollbackMigrations)}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'rollback' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}
                  <span>Rollback Migrations</span>
                </button>

                <button
                  onClick={() => handleAction('seed', runSeeds)}
                  disabled={!!actionLoading}
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'seed' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Seedling className="h-5 w-5" />
                  )}
                  <span>Run Seeds</span>
                </button>
              </div>
            </div>

            {/* Migrations Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Migration Status
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Completed ({status.migrations?.completed?.length || 0})
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {status.migrations?.completed?.length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {status.migrations.completed.map((migration, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            {migration.name || migration}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No completed migrations</p>
                    )}
                  </div>
                </div>
                {status.migrations?.pending?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pending ({status.migrations.pending.length})
                      </span>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                      <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                        {status.migrations.pending.map((migration, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            {migration.name || migration}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tables List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Database Tables
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Table Name
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Rows
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Size (MB)
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.tables?.map((table, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Table className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {table.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                          {parseInt(table.rowCount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                          {parseFloat(table.sizeMB || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewTable(table.name)}
                            disabled={actionLoading === `table-${table.name}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === `table-${table.name}` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Info className="h-3 w-3" />
                            )}
                            View Structure
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Structure Modal */}
            {showTableDetails && tableStructure && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Table Structure: {selectedTable}
                    </h3>
                    <button
                      onClick={() => {
                        setShowTableDetails(false);
                        setTableStructure(null);
                        setSelectedTable(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Total Rows: <span className="font-semibold">{tableStructure.rowCount}</span>
                      </p>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Columns
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3">Name</th>
                              <th className="text-left py-2 px-3">Type</th>
                              <th className="text-left py-2 px-3">Nullable</th>
                              <th className="text-left py-2 px-3">Default</th>
                              <th className="text-left py-2 px-3">Key</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableStructure.columns?.map((col, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-100 dark:border-gray-800"
                              >
                                <td className="py-2 px-3 font-mono text-gray-900 dark:text-white">
                                  {col.name}
                                </td>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                  {col.type}
                                </td>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                  {col.nullable === 'YES' ? 'Yes' : 'No'}
                                </td>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                  {col.defaultValue || '-'}
                                </td>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                  {col.key || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {tableStructure.indexes?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Indexes
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-left py-2 px-3">Name</th>
                                <th className="text-left py-2 px-3">Column</th>
                                <th className="text-left py-2 px-3">Unique</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableStructure.indexes.map((idx, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-100 dark:border-gray-800"
                                >
                                  <td className="py-2 px-3 font-mono text-gray-900 dark:text-white">
                                    {idx.name}
                                  </td>
                                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                    {idx.columnName}
                                  </td>
                                  <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                    {idx.nonUnique === 0 ? 'Yes' : 'No'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No database information available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

