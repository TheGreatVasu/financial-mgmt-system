const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');
const { broadcastDashboardUpdate } = require('../services/socketService');
const { generateInvoiceNumber } = require('../utils/generateInvoiceNumber');

function computeTotals(items = [], taxRate = 0) {
  const subTotal = Number(items.reduce((s, it) => s + Number(it.amount || it.total || it.price || 0), 0));
  const tax = Math.round((subTotal * Number(taxRate || 0)) / 100);
  const total = subTotal + tax;
  return { subTotal, tax, total };
}

// List invoices with basic filters
const getInvoices = asyncHandler(async (req, res) => {
  const db = getDb();
  const { page = 1, limit = 20, status, customer, from, to, q } = req.query;
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to view invoices' 
    });
  }
  
  if (db) {
    const qb = db('invoices as i').leftJoin('customers as c', 'c.id', 'i.customer_id');
    
    // CRITICAL: Filter by user to ensure data isolation
    // Also exclude NULL created_by to prevent showing orphaned data
    qb.where('i.created_by', userId).whereNotNull('i.created_by');
    
    if (status) qb.where('i.status', status);
    if (customer) qb.where('i.customer_id', customer);
    if (from) qb.where('i.created_at', '>=', new Date(from));
    if (to) qb.where('i.created_at', '<=', new Date(to));
    if (q) qb.whereILike('i.invoice_number', `%${q}%`);
    const rows = await qb
      .clone()
      .orderBy('i.created_at', 'desc')
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit))
      .select('i.*', 'c.company_name as customer_name');
    
    // Parse items JSON for each invoice
    const parsedRows = rows.map(row => {
      if (row.items && typeof row.items === 'string') {
        try {
          row.items = JSON.parse(row.items);
        } catch (e) {
          row.items = [];
        }
      }
      return row;
    });
    
    const [{ c }] = await qb.clone().count({ c: '*' });
    return res.json({ success: true, data: parsedRows, meta: { page: Number(page), limit: Number(limit), total: Number(c) } });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

const getInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  // Convert ID to number if it's a string (MySQL uses numeric IDs)
  const invoiceId = isNaN(id) ? id : Number(id);
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to view invoice' 
    });
  }
  
  if (db) {
    const row = await db('invoices as i')
      .leftJoin('customers as c', 'c.id', 'i.customer_id')
      .where('i.id', invoiceId)
      .where('i.created_by', userId) // CRITICAL: Ensure user can only access their own invoices
      .select('i.*', 'c.company_name as customer_name')
      .first();
    
    if (!row) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    // Parse items JSON if present
    if (row.items && typeof row.items === 'string') {
      try {
        row.items = JSON.parse(row.items);
      } catch (e) {
        row.items = [];
      }
    }
    
    return res.json({ success: true, data: row });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

const createInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const payload = req.body || {};
  
  // Enhanced logging for debugging
  console.log('Creating invoice with payload:', JSON.stringify(payload, null, 2));
  
  try {
    // Validate required fields
    if (!payload.customerId) {
      return res.status(400).json({ success: false, message: 'Customer ID is required' });
    }
    
    if (!payload.issueDate) {
      return res.status(400).json({ success: false, message: 'Issue date is required' });
    }
    
    if (!payload.dueDate) {
      return res.status(400).json({ success: false, message: 'Due date is required' });
    }
    
    // Parse and validate dates
    const issueDate = new Date(payload.issueDate);
    const dueDate = new Date(payload.dueDate);
    
    if (isNaN(issueDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid issue date format' });
    }
    
    if (isNaN(dueDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid due date format' });
    }
    
    // Generate invoice number automatically
    let invoiceNumber;
    try {
      invoiceNumber = await generateInvoiceNumber(issueDate);
      console.log('Generated invoice number:', invoiceNumber);
    } catch (genError) {
      console.error('Error generating invoice number:', genError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate invoice number',
        error: genError.message 
      });
    }
    
    const items = Array.isArray(payload.items) ? payload.items : [];
    
    // Validate items
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one invoice item is required' });
    }
    
    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || !item.description.trim()) {
        return res.status(400).json({ success: false, message: `Item ${i + 1}: description is required` });
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({ success: false, message: `Item ${i + 1}: valid quantity is required` });
      }
      if (item.unitPrice === undefined || item.unitPrice === null || Number(item.unitPrice) < 0) {
        return res.status(400).json({ success: false, message: `Item ${i + 1}: valid unit price is required` });
      }
    }
  
    // Calculate totals from items
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + (qty * price);
    }, 0);
  
    const taxRate = Number(payload.taxRate || 0);
    if (taxRate < 0 || taxRate > 100) {
      return res.status(400).json({ success: false, message: 'Tax rate must be between 0 and 100' });
    }
    
    const taxAmount = Math.round((subtotal * taxRate) / 100 * 100) / 100; // Round to 2 decimal places
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
  
    const now = new Date();
    
    if (db) {
      try {
        // Convert customerId to number if it's a string
        const customerId = Number(payload.customerId);
        if (isNaN(customerId)) {
          return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
        }
        
        // Verify customer exists
        const customer = await db('customers').where({ id: customerId }).first();
        if (!customer) {
          return res.status(400).json({ success: false, message: `Customer with ID ${customerId} not found` });
        }
        
        // Check if generated invoice number already exists (shouldn't happen, but safety check)
        const existing = await db('invoices').where({ invoice_number: invoiceNumber }).first();
        if (existing) {
          // If collision occurs, generate a new one (increment sequence)
          const year = new Date(issueDate).getFullYear();
          const yearPrefix = `INV-${year}`;
          const currentSequence = parseInt(invoiceNumber.substring(yearPrefix.length), 10);
          const newSequence = currentSequence + 1;
          invoiceNumber = `${yearPrefix}${String(newSequence).padStart(4, '0')}`;
        }
        
        // Prepare items with calculated totals
        const processedItems = items.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.quantity) * Number(item.unitPrice),
        }));
        
        // Format dates for MySQL (YYYY-MM-DD)
        const formatDateForMySQL = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        // Build row with only columns that exist in the database
        // Check which columns exist by attempting to describe the table structure
        // Get user ID from authenticated request
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ 
            success: false, 
            message: 'Authentication required to create invoice' 
          });
        }
        
        const row = {
          invoice_number: invoiceNumber,
          customer_id: customerId,
          issue_date: formatDateForMySQL(issueDate),
          due_date: formatDateForMySQL(dueDate),
          tax_rate: taxRate,
          subtotal: subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          paid_amount: 0,
          status: payload.status || 'draft',
          created_by: userId, // Set the user who created this invoice
          created_at: now,
        };
        
        // Add optional columns only if they have values (they may not exist in DB)
        // These will be handled gracefully if columns don't exist
        if (payload.poRef) {
          row.po_ref = payload.poRef;
        }
        if (payload.paymentTerms) {
          row.payment_terms = payload.paymentTerms;
        }
        if (payload.notes) {
          row.notes = payload.notes;
        }
        
        // Items column - try to add it, but handle gracefully if it doesn't exist
        try {
          row.items = JSON.stringify(processedItems);
        } catch (e) {
          console.warn('Could not stringify items:', e);
          // Continue without items column if it fails
        }
        
        console.log('Inserting invoice row:', JSON.stringify(row, null, 2));
        
        let id;
        try {
          [id] = await db('invoices').insert(row);
          console.log('Invoice created with ID:', id);
        } catch (insertError) {
          console.error('Database insert error:', insertError);
          console.error('Error code:', insertError.code);
          console.error('Error errno:', insertError.errno);
          console.error('Error sql:', insertError.sql);
          
          // If error is due to unknown column, try inserting without optional columns
          if (insertError.code === 'ER_BAD_FIELD_ERROR' || insertError.errno === 1054) {
            console.log('Retrying insert without optional columns (missing columns in database)...');
            
            // Create minimal row with only required columns that definitely exist
            const minimalRow = {
              invoice_number: invoiceNumber,
              customer_id: customerId,
              issue_date: formatDateForMySQL(issueDate),
              due_date: formatDateForMySQL(dueDate),
              tax_rate: taxRate,
              subtotal: subtotal,
              tax_amount: taxAmount,
              total_amount: total,
              paid_amount: 0,
              status: payload.status || 'draft',
              created_at: now,
            };
            
            try {
              [id] = await db('invoices').insert(minimalRow);
              console.log('Invoice created with minimal columns, ID:', id);
              
              // Try to update with optional fields if columns exist
              const updateData = {};
              if (payload.poRef) updateData.po_ref = payload.poRef;
              if (payload.paymentTerms) updateData.payment_terms = payload.paymentTerms;
              if (payload.notes) updateData.notes = payload.notes;
              
              // Try to add items if column exists
              try {
                updateData.items = JSON.stringify(processedItems);
              } catch (e) {
                console.warn('Could not stringify items:', e);
              }
              
              // Update with optional fields (ignore errors for missing columns)
              if (Object.keys(updateData).length > 0) {
                try {
                  await db('invoices').where({ id }).update(updateData);
                  console.log('Optional fields updated successfully');
                } catch (updateErr) {
                  console.warn('Could not update optional fields (columns may not exist):', updateErr.message);
                  // Continue - invoice was created successfully with required fields
                }
              }
            } catch (retryError) {
              console.error('Retry insert also failed:', retryError);
              throw insertError; // Throw original error
            }
          } else {
            throw insertError;
          }
        }
        
        // Fetch the created invoice with items parsed and customer name
        const created = await db('invoices as i')
          .leftJoin('customers as c', 'c.id', 'i.customer_id')
          .where('i.id', id)
          .select('i.*', 'c.company_name as customer_name')
          .first();
        
        if (!created) {
          return res.status(500).json({ success: false, message: 'Invoice created but could not be retrieved' });
        }
        
        if (created && created.items) {
          try {
            created.items = JSON.parse(created.items);
          } catch (e) {
            console.error('Error parsing invoice items:', e);
            created.items = [];
          }
        }
        
        // Emit dashboard update
        broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
        return res.status(201).json({ success: true, data: created });
      } catch (dbError) {
        console.error('Database error creating invoice:', dbError);
        console.error('Error stack:', dbError.stack);
        console.error('Error code:', dbError.code);
        console.error('Error errno:', dbError.errno);
        console.error('Error sqlMessage:', dbError.sqlMessage);
        console.error('Error sql:', dbError.sql);
        
        // Handle specific database errors
        if (dbError.code === 'ER_DUP_ENTRY' || dbError.errno === 1062) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invoice number already exists. Please try again.',
            details: dbError.sqlMessage 
          });
        }
        
        if (dbError.code === 'ER_NO_REFERENCED_ROW_2' || dbError.errno === 1452) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid customer reference',
            details: dbError.sqlMessage 
          });
        }
        
        if (dbError.code === 'ER_BAD_FIELD_ERROR' || dbError.errno === 1054) {
          return res.status(500).json({ 
            success: false, 
            message: 'Database schema error. Please contact administrator.',
            details: dbError.sqlMessage 
          });
        }
        
        // Return detailed error in development, generic in production
        const errorMessage = process.env.NODE_ENV === 'development' 
          ? (dbError.sqlMessage || dbError.message || 'Database error occurred while creating invoice')
          : 'An error occurred while creating the invoice. Please try again.';
        
        return res.status(500).json({ 
          success: false, 
          message: errorMessage,
          ...(process.env.NODE_ENV === 'development' && { 
            error: dbError.message,
            code: dbError.code,
            errno: dbError.errno
          })
        });
      }
  } else {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }
  } catch (error) {
    console.error('Error creating invoice:', error);
    
    // Handle specific database error types
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invoice number already exists. Please try again.' 
      });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid customer reference' 
      });
    }
    
    const errorMessage = error.message || 'Failed to create invoice';
    return res.status(500).json({ success: false, message: errorMessage });
  }
});

const updateInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  const payload = req.body || {};
  
  try {
    // Validate invoice ID
    if (!id) {
      return res.status(400).json({ success: false, message: 'Invoice ID is required' });
    }
    
    // Convert ID to number if it's a string (MySQL uses numeric IDs)
    const invoiceId = isNaN(id) ? id : Number(id);
    
    // Ensure we have at least some data to update
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided for update' });
    }
    
    // Get user ID from authenticated request - CRITICAL for user isolation
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required to update invoice' 
      });
    }
    
    if (db) {
      // First, check if invoice exists AND belongs to the user
      const existing = await db('invoices')
        .where({ id: invoiceId })
        .where('created_by', userId) // CRITICAL: Ensure user can only update their own invoices
        .first();
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      
      // Invoice number cannot be changed after creation (it's auto-generated)
      // If invoiceNumber is provided in update, ignore it or return an error
      if (payload.invoiceNumber !== undefined) {
        // Optionally, we can allow updates but validate uniqueness
        if (!payload.invoiceNumber || !payload.invoiceNumber.trim()) {
          return res.status(400).json({ success: false, message: 'Invoice number cannot be empty' });
        }
        // Check if invoice number already exists (excluding current invoice)
        const duplicate = await db('invoices')
          .where({ invoice_number: payload.invoiceNumber.trim() })
          .whereNot({ id: invoiceId })
          .first();
        if (duplicate) {
          return res.status(400).json({ success: false, message: 'Invoice number already exists' });
        }
      }
      
      // Validate customer if provided
      if (payload.customerId !== undefined) {
        const customer = await db('customers').where({ id: payload.customerId }).first();
        if (!customer) {
          return res.status(400).json({ success: false, message: 'Customer not found' });
        }
      }
      
      // Validate dates if provided
      if (payload.issueDate !== undefined && payload.issueDate !== null) {
        const issueDate = new Date(payload.issueDate);
        if (isNaN(issueDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid issue date format' });
        }
      }
      
      if (payload.dueDate !== undefined && payload.dueDate !== null) {
        const dueDate = new Date(payload.dueDate);
        if (isNaN(dueDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid due date format' });
        }
      }
      
      // Validate items if provided
      let items = [];
      if (payload.items !== undefined) {
        items = Array.isArray(payload.items) ? payload.items : [];
        
        if (items.length === 0) {
          return res.status(400).json({ success: false, message: 'At least one invoice item is required' });
        }
        
        // Validate each item
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.description || !item.description.trim()) {
            return res.status(400).json({ success: false, message: `Item ${i + 1}: description is required` });
          }
          if (!item.quantity || Number(item.quantity) <= 0) {
            return res.status(400).json({ success: false, message: `Item ${i + 1}: valid quantity is required` });
          }
          if (item.unitPrice === undefined || item.unitPrice === null || Number(item.unitPrice) < 0) {
            return res.status(400).json({ success: false, message: `Item ${i + 1}: valid unit price is required` });
          }
        }
      } else {
        // Use existing items if not provided
        if (existing.items) {
          try {
            items = typeof existing.items === 'string' ? JSON.parse(existing.items) : existing.items;
          } catch (e) {
            items = [];
          }
        }
      }
    
    // Calculate totals from items
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.unitPrice || 0);
      return sum + (qty * price);
    }, 0);
    
      // Use provided tax rate or existing one
      const taxRate = payload.taxRate !== undefined ? Number(payload.taxRate || 0) : Number(existing.tax_rate || 0);
      if (taxRate < 0 || taxRate > 100) {
        return res.status(400).json({ success: false, message: 'Tax rate must be between 0 and 100' });
      }
      
      const taxAmount = Math.round((subtotal * taxRate) / 100 * 100) / 100; // Round to 2 decimal places
      const total = Math.round((subtotal + taxAmount) * 100) / 100;
    
    const updateData = {};
    
    // Only update fields that are provided
      if (payload.invoiceNumber !== undefined) updateData.invoice_number = payload.invoiceNumber.trim();
    if (payload.customerId !== undefined) updateData.customer_id = payload.customerId;
      if (payload.issueDate !== undefined) {
        updateData.issue_date = payload.issueDate ? new Date(payload.issueDate) : existing.issue_date;
      }
      if (payload.dueDate !== undefined) {
        updateData.due_date = payload.dueDate ? new Date(payload.dueDate) : existing.due_date;
      }
    if (payload.poRef !== undefined) updateData.po_ref = payload.poRef || null;
    if (payload.paymentTerms !== undefined) updateData.payment_terms = payload.paymentTerms || null;
    if (payload.taxRate !== undefined) updateData.tax_rate = taxRate;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.notes !== undefined) updateData.notes = payload.notes || null;
    
      // Always update calculated fields if items are provided or recalculated
      if (payload.items !== undefined || payload.taxRate !== undefined) {
      updateData.subtotal = subtotal;
      updateData.tax_amount = taxAmount;
      updateData.total_amount = total;
      
        // Prepare items with calculated totals
        const processedItems = items.map(item => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.quantity) * Number(item.unitPrice),
        }));
        
        updateData.items = JSON.stringify(processedItems);
    }
    
      // Update the invoice - handle potential missing columns gracefully
    try {
        await db('invoices').where({ id: invoiceId }).update(updateData);
    } catch (updateError) {
        console.error('Database update error:', updateError);
      const errorMsg = updateError.message || '';
        
        // If error is due to unknown column, try updating without optional columns
        if (errorMsg.includes('Unknown column') || errorMsg.includes('doesn\'t exist')) {
          console.warn('Attempting update without optional columns:', errorMsg);
          
          // Remove optional columns that might not exist
          const safeUpdateData = { ...updateData };
          delete safeUpdateData.payment_terms;
          delete safeUpdateData.po_ref;
          delete safeUpdateData.notes;
          delete safeUpdateData.items;
          
          // Only keep essential columns
          const essentialFields = ['invoice_number', 'customer_id', 'issue_date', 'due_date', 
                                   'tax_rate', 'subtotal', 'tax_amount', 'total_amount', 
                                   'paid_amount', 'status'];
          const filteredUpdateData = {};
          for (const key of Object.keys(safeUpdateData)) {
            if (essentialFields.includes(key)) {
              filteredUpdateData[key] = safeUpdateData[key];
            }
          }
          
          // Add back items if column exists (will be caught if it doesn't)
          if (updateData.items) {
            filteredUpdateData.items = updateData.items;
          }
          
        try {
            await db('invoices').where({ id: invoiceId }).update(filteredUpdateData);
            console.log('Update succeeded with filtered columns');
        } catch (retryError) {
            console.error('Retry update also failed:', retryError);
            // If items column doesn't exist, try without it
            if (retryError.message && retryError.message.includes('items')) {
              delete filteredUpdateData.items;
              await db('invoices').where({ id: invoiceId }).update(filteredUpdateData);
            } else {
              throw retryError;
            }
        }
      } else {
        throw updateError;
      }
    }
    
    // Fetch updated invoice with items parsed
    const row = await db('invoices as i')
      .leftJoin('customers as c', 'c.id', 'i.customer_id')
        .where('i.id', invoiceId)
      .select('i.*', 'c.company_name as customer_name')
      .first();
    
    if (!row) {
      return res.status(404).json({ success: false, message: 'Invoice not found after update' });
    }
    
    // Parse items JSON if present
    if (row.items && typeof row.items === 'string') {
      try {
        row.items = JSON.parse(row.items);
      } catch (e) {
        row.items = [];
      }
    } else if (!row.items) {
      row.items = [];
    }
    
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true, data: row });
  }
  
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
  } catch (error) {
    console.error('Error updating invoice:', error);
    console.error('Error stack:', error.stack);
    console.error('Request payload:', JSON.stringify(payload, null, 2));
    console.error('Invoice ID:', id);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update invoice';
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
      
      // Database connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        errorMessage = 'Database connection failed. Please try again later.';
        statusCode = 503;
      }
      // SQL syntax errors
      else if (error.message.includes('SQL') || error.message.includes('syntax')) {
        errorMessage = 'Database error occurred. Please contact support.';
        statusCode = 500;
      }
      // Foreign key constraint errors
      else if (error.message.includes('foreign key') || error.message.includes('constraint')) {
        errorMessage = 'Invalid customer or invoice reference.';
        statusCode = 400;
      }
      // Column not found errors
      else if (error.message.includes('Unknown column') || error.message.includes('doesn\'t exist')) {
        errorMessage = 'Database schema mismatch. Please run migrations.';
        statusCode = 500;
      }
    }
    
    return res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const db = getDb();
  const id = req.params.id;
  // Convert ID to number if it's a string (MySQL uses numeric IDs)
  const invoiceId = isNaN(id) ? id : Number(id);
  
  // Get user ID from authenticated request - CRITICAL for user isolation
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required to delete invoice' 
    });
  }
  
  if (db) {
    // CRITICAL: Only allow deletion of invoices created by the user
    const deleted = await db('invoices')
      .where({ id: invoiceId })
      .where('created_by', userId)
      .delete();
    
    if (deleted === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or you do not have permission to delete it' 
      });
    }
    // Emit dashboard update
    broadcastDashboardUpdate().catch(err => console.error('Error broadcasting dashboard update:', err));
    return res.json({ success: true });
  }
  return res.status(503).json({
    success: false,
    message: 'Database connection not available'
  });
});

// Get next invoice number for preview (doesn't reserve it, just shows what it would be)
const getNextInvoiceNumber = asyncHandler(async (req, res) => {
  try {
    const { issueDate } = req.query;
    const date = issueDate ? new Date(issueDate) : new Date();
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid issue date format' });
    }
    
    const invoiceNumber = await generateInvoiceNumber(date);
    return res.json({ success: true, data: { invoiceNumber } });
  } catch (error) {
    console.error('Error generating next invoice number:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate invoice number' 
    });
  }
});

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getNextInvoiceNumber };
