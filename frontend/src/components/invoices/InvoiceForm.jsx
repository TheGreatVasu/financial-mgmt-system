import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { createApiClient } from '../../services/apiClient';

export default function InvoiceForm({ invoice, onSubmit, onCancel }) {
  const { token } = useAuthContext();
  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || invoice?.customer_id || invoice?.customer || '',
    issueDate: invoice?.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : 
              invoice?.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : 
             invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
    paymentTerms: invoice?.paymentTerms || invoice?.payment_terms || 'net30',
    taxRate: invoice?.taxRate || invoice?.tax_rate || 0,
    notes: invoice?.notes || '',
    items: invoice?.items || [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  });

  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoiceNumber || invoice?.invoice_number || '');

  // Load customers
  useEffect(() => {
    if (!token) return;
    
    async function loadCustomers() {
      try {
        const api = createApiClient(token);
        const { data } = await api.get('/customers?limit=100');
        setCustomers(data?.data || []);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    }
    loadCustomers();
  }, [token]);

  // Fetch next invoice number when form opens (for new invoices only)
  useEffect(() => {
    if (!token || invoice) return; // Don't fetch if editing existing invoice
    
    async function fetchNextInvoiceNumber() {
      try {
        const api = createApiClient(token);
        const issueDate = formData.issueDate || new Date().toISOString().split('T')[0];
        const { data } = await api.get(`/invoices/next-number?issueDate=${issueDate}`);
        if (data?.success && data?.data?.invoiceNumber) {
          setInvoiceNumber(data.data.invoiceNumber);
        }
      } catch (err) {
        console.error('Failed to fetch next invoice number:', err);
        // Set a placeholder if fetch fails
        setInvoiceNumber('Loading...');
      }
    }
    
    fetchNextInvoiceNumber();
  }, [token, invoice]); // Only run once on mount for new invoices

  // Update invoice number when issue date changes (for new invoices only)
  useEffect(() => {
    if (!token || invoice || !formData.issueDate) return;
    
    async function updateInvoiceNumber() {
      try {
        const api = createApiClient(token);
        const { data } = await api.get(`/invoices/next-number?issueDate=${formData.issueDate}`);
        if (data?.success && data?.data?.invoiceNumber) {
          setInvoiceNumber(data.data.invoiceNumber);
        }
      } catch (err) {
        console.error('Failed to update invoice number:', err);
      }
    }
    
    // Debounce the API call
    const timeoutId = setTimeout(updateInvoiceNumber, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.issueDate, token, invoice]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + (qty * price);
    }, 0);
    
    const taxRate = Number(formData.taxRate || 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  }, [formData.items, formData.taxRate]);

  // Update item total when quantity or price changes
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    
    // Recalculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = Number(newItems[index].quantity || 0);
      const price = Number(newItems[index].unitPrice || 0);
      newItems[index].total = qty * price;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  // Add new item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length <= 1) return; // Keep at least one item
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    formData.items.forEach((item, index) => {
      if (!item.description?.trim()) {
        newErrors[`item_${index}_description`] = 'Item description is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        newErrors[`item_${index}_unitPrice`] = 'Valid unit price is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        customerId: formData.customerId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        paymentTerms: formData.paymentTerms,
        taxRate: Number(formData.taxRate || 0),
        notes: formData.notes,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
      };
      
      await onSubmit(payload);
      // Clear form errors on success
      setErrors({});
    } catch (err) {
      console.error('Failed to save invoice:', err);
      setErrors({ submit: err?.message || 'Failed to save invoice' });
      // Re-throw to let parent handle (e.g., keep modal open on error)
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-secondary-700 border-b border-secondary-200 pb-2">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Invoice Number
            </label>
            <div className="input bg-secondary-50 text-secondary-600 cursor-not-allowed">
              {invoiceNumber || (invoice ? (invoice.invoiceNumber || invoice.invoice_number || 'N/A') : 'Loading...')}
            </div>
            <p className="text-xs text-secondary-500 mt-1">
              {invoice 
                ? 'Invoice number cannot be changed' 
                : 'Invoice number is automatically generated (Format: INV-YYYYNNNN)'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Customer <span className="text-danger-500">*</span>
            </label>
            <select
              className={`input ${errors.customerId ? 'border-danger-500' : ''}`}
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id || customer._id} value={customer.id || customer._id}>
                  {customer.companyName || customer.company_name || customer.name || 'Unknown'}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-danger-500 mt-1">{errors.customerId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Issue Date <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              className={`input ${errors.issueDate ? 'border-danger-500' : ''}`}
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              required
            />
            {errors.issueDate && (
              <p className="text-xs text-danger-500 mt-1">{errors.issueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Due Date <span className="text-danger-500">*</span>
            </label>
            <input
              type="date"
              className={`input ${errors.dueDate ? 'border-danger-500' : ''}`}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={formData.issueDate}
              required
            />
            {errors.dueDate && (
              <p className="text-xs text-danger-500 mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Payment Terms
            </label>
            <select
              className="input"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            >
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
              <option value="net45">Net 45</option>
              <option value="net60">Net 60</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              className="input"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-secondary-700 border-b border-secondary-200 pb-2">
            Invoice Items <span className="text-danger-500">*</span>
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        {errors.items && (
          <p className="text-xs text-danger-500">{errors.items}</p>
        )}

        <div className="space-y-3">
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-3 p-3 border border-secondary-200 rounded-lg bg-secondary-50/50 hover:bg-secondary-50 transition-colors"
            >
              <div className="col-span-12 md:col-span-5">
                <label className="block text-xs font-medium text-secondary-600 mb-1">
                  Description <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  className={`input text-sm ${errors[`item_${index}_description`] ? 'border-danger-500' : ''}`}
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Item description"
                  required
                />
                {errors[`item_${index}_description`] && (
                  <p className="text-xs text-danger-500 mt-1">{errors[`item_${index}_description`]}</p>
                )}
              </div>

              <div className="col-span-4 md:col-span-2">
                <label className="block text-xs font-medium text-secondary-600 mb-1">
                  Quantity <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  className={`input text-sm ${errors[`item_${index}_quantity`] ? 'border-danger-500' : ''}`}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
                {errors[`item_${index}_quantity`] && (
                  <p className="text-xs text-danger-500 mt-1">{errors[`item_${index}_quantity`]}</p>
                )}
              </div>

              <div className="col-span-4 md:col-span-2">
                <label className="block text-xs font-medium text-secondary-600 mb-1">
                  Unit Price <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  className={`input text-sm ${errors[`item_${index}_unitPrice`] ? 'border-danger-500' : ''}`}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
                {errors[`item_${index}_unitPrice`] && (
                  <p className="text-xs text-danger-500 mt-1">{errors[`item_${index}_unitPrice`]}</p>
                )}
              </div>

              <div className="col-span-3 md:col-span-2">
                <label className="block text-xs font-medium text-secondary-600 mb-1">
                  Total
                </label>
                <div className="input text-sm bg-white font-semibold text-secondary-900">
                  ₹{Number(item.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="col-span-1 flex items-end">
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-danger-500 hover:text-danger-700 hover:bg-danger-50 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-secondary-200 pt-4">
        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-sm text-secondary-600">
              <span>Subtotal:</span>
              <span className="font-medium">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary-600">
              <span>Tax ({formData.taxRate}%):</span>
              <span className="font-medium">₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-secondary-900 border-t border-secondary-200 pt-2">
              <span>Total:</span>
              <span>₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Notes
        </label>
        <textarea
          className="input min-h-[80px]"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or comments..."
        />
      </div>

      {errors.submit && (
        <div className="rounded-md border border-danger-200 bg-danger-50 text-danger-700 px-4 py-3 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}

