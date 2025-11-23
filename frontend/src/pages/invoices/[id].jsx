import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Download, ArrowLeft, FileText, Calendar, User, DollarSign, AlertCircle, Loader2, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { createInvoiceService } from '../../services/invoiceService.js';
import InvoiceForm from '../../components/invoices/InvoiceForm.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const invoiceService = useMemo(() => createInvoiceService(token), [token]);

  useEffect(() => {
    if (token && id) {
      loadInvoice();
    }
  }, [id, token, invoiceService]);

  async function loadInvoice() {
    if (!token || !id) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await invoiceService.get(id);
      setInvoice(response?.data || response);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to load invoice';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Failed to load invoice:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(payload) {
    try {
      await invoiceService.update(id, payload);
      toast.success('Invoice updated successfully!');
      await loadInvoice();
      setIsEditing(false);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to update invoice';
      toast.error(errorMsg);
      throw err;
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await invoiceService.remove(id);
      toast.success('Invoice deleted successfully!');
      navigate('/invoices');
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to delete invoice';
      toast.error(errorMsg);
      setIsDeleting(false);
    }
  }

  async function handleExportPDF() {
    try {
      const { createApiClient } = await import('../../services/apiClient');
      const api = createApiClient(token);
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoiceNumber || invoice?.invoice_number || id}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported successfully!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error('PDF export is not available. Please try again later.');
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error && !invoice) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-danger-800">Error</p>
              <p className="text-sm text-danger-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Link
            to="/invoices"
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-900 hover:underline transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (isEditing) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Edit Invoice</h1>
              <p className="text-sm text-secondary-600 mt-1">Update invoice details</p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80"
            >
              Cancel
            </button>
          </div>
          
          <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
            <InvoiceForm
              invoice={invoice}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const invoiceData = invoice || {};
  
  // Parse items if they come as a JSON string from the database
  let items = [];
  if (invoiceData.items) {
    if (typeof invoiceData.items === 'string') {
      try {
        items = JSON.parse(invoiceData.items);
      } catch (e) {
        console.error('Failed to parse items:', e);
        items = [];
      }
    } else if (Array.isArray(invoiceData.items)) {
      items = invoiceData.items;
    }
  }
  
  const subtotal = items.reduce((sum, item) => sum + (Number(item.total) || Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const taxRate = Number(invoiceData.taxRate || invoiceData.tax_rate || 0);
  const taxAmount = invoiceData.taxAmount || invoiceData.tax_amount || (subtotal * taxRate) / 100;
  const totalAmount = invoiceData.totalAmount || invoiceData.total_amount || (subtotal + taxAmount);
  const paidAmount = Number(invoiceData.paidAmount || invoiceData.paid_amount || 0);
  const outstandingAmount = totalAmount - paidAmount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/invoices"
              className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Invoice {invoiceData.invoiceNumber || invoiceData.invoice_number || 'N/A'}
              </h1>
              <p className="text-sm text-secondary-600 mt-1">Invoice details and payment history</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-secondary-200 text-sm text-secondary-700 hover:bg-secondary-100/80 transition-colors"
              title="Export as PDF"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-danger-200 text-sm text-danger-700 hover:bg-danger-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-danger-800">Error</p>
                <p className="text-sm text-danger-700 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="text-danger-600 hover:text-danger-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoice Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Invoice Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Invoice Number</p>
                <p className="text-sm font-semibold text-secondary-900">{invoiceData.invoiceNumber || invoiceData.invoice_number || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Issue Date</p>
                <p className="text-sm font-semibold text-secondary-900">
                  {invoiceData.issueDate ? new Date(invoiceData.issueDate).toLocaleDateString('en-IN') : 
                   invoiceData.issue_date ? new Date(invoiceData.issue_date).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Due Date</p>
                <p className="text-sm font-semibold text-secondary-900">
                  {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-IN') : 
                   invoiceData.due_date ? new Date(invoiceData.due_date).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-violet-50 rounded-lg">
                <User className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Customer</p>
                <p className="text-sm font-semibold text-secondary-900">
                  {invoiceData.customer_name || invoiceData.customer?.companyName || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-sky-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  invoiceData.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  invoiceData.status === 'overdue' ? 'bg-rose-100 text-rose-700' :
                  invoiceData.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                  'bg-secondary-100 text-secondary-700'
                }`}>
                  {invoiceData.status || 'draft'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Payment Terms</p>
                <p className="text-sm font-semibold text-secondary-900">
                  {invoiceData.paymentTerms || invoiceData.payment_terms || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Invoice Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Invoice Items</h2>
          
          {items.length === 0 ? (
            <p className="text-sm text-secondary-500">No items found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 text-left text-secondary-600">
                    <th className="py-3 px-4 font-medium">Description</th>
                    <th className="py-3 px-4 font-medium text-right">Quantity</th>
                    <th className="py-3 px-4 font-medium text-right">Unit Price</th>
                    <th className="py-3 px-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50/50 transition-colors">
                      <td className="py-3 px-4 text-secondary-900">{item.description || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-secondary-700">{item.quantity || 0}</td>
                      <td className="py-3 px-4 text-right text-secondary-700">
                        ₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-secondary-900">
                        ₹{Number(item.total || (item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Subtotal:</span>
                <span className="font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Tax ({taxRate}%):</span>
                <span className="font-medium">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-secondary-900 border-t border-secondary-200 pt-2">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Paid Amount:</span>
                <span className="font-medium text-emerald-600">₹{paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-secondary-200 pt-2">
                <span className={outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  Outstanding:
                </span>
                <span className={outstandingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  ₹{outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        {invoiceData.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-secondary-900 mb-2">Notes</h2>
            <p className="text-sm text-secondary-700 whitespace-pre-wrap">{invoiceData.notes}</p>
          </motion.div>
        )}

        {/* Payment History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Payment History</h2>
          {paidAmount > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Payment Received</p>
                  <p className="text-xs text-emerald-700">Paid amount: ₹{paidAmount.toLocaleString('en-IN')}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-700">
                  ₹{paidAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-secondary-500">
              <AlertCircle className="h-4 w-4" />
              No payments recorded yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Invoice"
        variant="dialog"
        size="sm"
        footer={(
          <>
            <button
              className="btn btn-outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary bg-danger-600 hover:bg-danger-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm text-secondary-700">
            Are you sure you want to delete invoice <strong>{invoiceData.invoiceNumber}</strong>?
          </p>
          <p className="text-xs text-secondary-500">
            This action cannot be undone. All invoice data will be permanently deleted.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
