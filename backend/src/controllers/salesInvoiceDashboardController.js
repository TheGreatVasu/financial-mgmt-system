const { asyncHandler } = require('../middlewares/errorHandler');
const { getDb } = require('../config/db');

/**
 * Build filter query based on request parameters
 */
function buildFilterQuery(query, filters, db) {
  if (!filters || Object.keys(filters).length === 0) {
    return query;
  }

  // Date range filter
  if (filters.dateFrom) {
    query = query.where('gst_tax_invoice_date', '>=', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.where('gst_tax_invoice_date', '<=', filters.dateTo);
  }

  // Customer filter
  if (filters.customer) {
    query = query.where('customer_name', filters.customer);
  }

  // Business Unit filter
  if (filters.businessUnit) {
    query = query.where('business_unit', filters.businessUnit);
  }

  // Region filter
  if (filters.region) {
    query = query.where('region', filters.region);
  }

  // Zone filter
  if (filters.zone) {
    query = query.where('zone', filters.zone);
  }

  // Invoice Type filter
  if (filters.invoiceType) {
    query = query.where('invoice_type', filters.invoiceType);
  }

  // Amount range filter
  if (filters.amountMin !== undefined && filters.amountMin !== null) {
    query = query.where('total_invoice_value', '>=', filters.amountMin);
  }
  if (filters.amountMax !== undefined && filters.amountMax !== null) {
    query = query.where('total_invoice_value', '<=', filters.amountMax);
  }

  // Tax type filter - filter invoices that have the selected tax types
  if (filters.taxTypes && Array.isArray(filters.taxTypes) && filters.taxTypes.length > 0) {
    const taxConditions = filters.taxTypes.map(taxType => {
      switch(taxType) {
        case 'CGST':
          return db.raw('cgst_output > 0');
        case 'SGST':
          return db.raw('sgst_output > 0');
        case 'IGST':
          return db.raw('igst_output > 0');
        case 'UGST':
          return db.raw('ugst_output > 0');
        case 'TCS':
          return db.raw('tcs > 0');
        default:
          return null;
      }
    }).filter(condition => condition !== null);
    
    if (taxConditions.length > 0) {
      query = query.where(function() {
        taxConditions.forEach((condition, index) => {
          if (index === 0) {
            this.whereRaw(condition);
          } else {
            this.orWhereRaw(condition);
          }
        });
      });
    }
  }

  return query;
}

/**
 * GET /api/dashboard/sales-invoice
 * Get comprehensive dashboard data from sales_invoice_master table
 * Supports query parameters for filtering:
 * - dateFrom, dateTo: Date range filter
 * - customer: Customer name filter
 * - businessUnit: Business unit filter
 * - region: Region filter
 * - zone: Zone filter
 * - invoiceType: Invoice type filter
 * - amountMin, amountMax: Amount range filter
 * - taxTypes: Comma-separated tax types (CGST,SGST,IGST,UGST,TCS)
 */
exports.getSalesInvoiceDashboard = asyncHandler(async (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not available'
    });
  }

  // CRITICAL: Get user ID from authenticated request - REQUIRED for user data isolation
  const userId = req.user?.id || null;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access sales invoice dashboard'
    });
  }

  console.log(`📊 Sales Invoice Dashboard request for user ID: ${userId} (Email: ${req.user?.email || 'N/A'})`);

  try {
    // Extract filters from query parameters
    const filters = {};
    if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
    if (req.query.dateTo) filters.dateTo = req.query.dateTo;
    if (req.query.customer) filters.customer = req.query.customer;
    if (req.query.businessUnit) filters.businessUnit = req.query.businessUnit;
    if (req.query.region) filters.region = req.query.region;
    if (req.query.zone) filters.zone = req.query.zone;
    if (req.query.invoiceType) filters.invoiceType = req.query.invoiceType;
    if (req.query.amountMin) filters.amountMin = parseFloat(req.query.amountMin);
    if (req.query.amountMax) filters.amountMax = parseFloat(req.query.amountMax);
    if (req.query.taxTypes) {
      filters.taxTypes = req.query.taxTypes.split(',').map(t => t.trim());
    }

    // Check if table exists first
    const tableExists = await db.schema.hasTable('sales_invoice_master');
    if (!tableExists) {
      return res.json({
        success: true,
        data: {
          hasData: false,
          summary: {
            totalInvoiceAmount: 0,
            totalTax: 0,
            totalDeductions: 0,
            totalPenaltyLD: 0,
            freight: 0,
            insurance: 0,
            badDebts: 0,
            netReceivables: 0
          },
          invoices: [],
          regionWise: [],
          businessUnitWise: [],
          customerWise: [],
          taxBreakup: { cgst: 0, sgst: 0, igst: 0, ugst: 0, tcs: 0 },
          monthlyTrends: [],
          deductionComparison: [],
          reconciliation: {
            excessQty: 0,
            shortage: 0,
            lcDiscrepancy: 0,
            bankCharges: 0,
            interest: 0,
            otherExceptions: []
          },
          availableOptions: {
            customers: [],
            businessUnits: [],
            regions: [],
            zones: [],
            invoiceTypes: []
          }
        }
      });
    }

    // CRITICAL: Get all invoices with filters applied AND user filtering
    // This ensures each user only sees their own imported sales invoices
    let invoicesQuery = db('sales_invoice_master')
      .select('*')
      .where('created_by', userId) // CRITICAL: Filter by user
      .whereNotNull('created_by'); // CRITICAL: Exclude orphaned data
    
    invoicesQuery = buildFilterQuery(invoicesQuery, filters, db);
    const invoices = await invoicesQuery
      .orderBy('gst_tax_invoice_date', 'desc')
      .limit(10000); // Reasonable limit

    // Get available filter options (for dropdowns) - ALSO filtered by user
    const allInvoices = await db('sales_invoice_master')
      .select('customer_name', 'business_unit', 'region', 'zone', 'invoice_type')
      .where('created_by', userId) // CRITICAL: Only show options from user's own data
      .whereNotNull('created_by');
    const customers = [...new Set(allInvoices.map(inv => inv.customer_name).filter(Boolean))].sort();
    const businessUnits = [...new Set(allInvoices.map(inv => inv.business_unit).filter(Boolean))].sort();
    const regions = [...new Set(allInvoices.map(inv => inv.region).filter(Boolean))].sort();
    const zones = [...new Set(allInvoices.map(inv => inv.zone).filter(Boolean))].sort();
    const invoiceTypes = [...new Set(allInvoices.map(inv => inv.invoice_type).filter(Boolean))].sort();

    if (invoices.length === 0) {
      return res.json({
        success: true,
        data: {
          hasData: false,
          summary: {
            totalInvoiceAmount: 0,
            totalTax: 0,
            totalDeductions: 0,
            totalPenaltyLD: 0,
            freight: 0,
            insurance: 0,
            badDebts: 0,
            netReceivables: 0
          },
          invoices: [],
          regionWise: [],
          businessUnitWise: [],
          customerWise: [],
          taxBreakup: { cgst: 0, sgst: 0, igst: 0, ugst: 0, tcs: 0 },
          monthlyTrends: [],
          deductionComparison: [],
          reconciliation: {
            excessQty: 0,
            shortage: 0,
            lcDiscrepancy: 0,
            bankCharges: 0,
            interest: 0,
            otherExceptions: []
          },
          availableOptions: {
            customers,
            businessUnits,
            regions,
            zones,
            invoiceTypes
          }
        }
      });
    }

    // Calculate financial summary
    const summary = {
      totalInvoiceAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total_invoice_value || 0), 0),
      totalTax: invoices.reduce((sum, inv) => 
        sum + parseFloat(inv.sgst_output || 0) + parseFloat(inv.cgst_output || 0) + 
        parseFloat(inv.igst_output || 0) + parseFloat(inv.ugst_output || 0) + parseFloat(inv.tcs || 0), 0),
      totalDeductions: invoices.reduce((sum, inv) => 
        sum + parseFloat(inv.it_tds_2_percent_service || 0) + parseFloat(inv.it_tds_1_percent_194q_supply || 0) +
        parseFloat(inv.lcess_boq_1_percent_works || 0) + parseFloat(inv.tds_2_percent_cgst_sgst || 0) +
        parseFloat(inv.tds_on_cgst_1_percent || 0) + parseFloat(inv.tds_on_sgst_1_percent || 0), 0),
      totalPenaltyLD: invoices.reduce((sum, inv) => sum + parseFloat(inv.penalty_ld_deduction || 0), 0),
      freight: invoices.reduce((sum, inv) => sum + parseFloat(inv.freight_value || 0), 0),
      insurance: 0, // Not in current schema, can be added later
      badDebts: invoices.reduce((sum, inv) => sum + parseFloat(inv.bad_debts || 0), 0),
      netReceivables: 0 // Calculated below
    };

    summary.netReceivables = summary.totalInvoiceAmount - summary.totalDeductions - summary.totalPenaltyLD - summary.badDebts;

    // Region/Zone-wise aggregation
    const regionMap = new Map();
    invoices.forEach(inv => {
      const region = inv.region || 'Unknown';
      const zone = inv.zone || 'Unknown';
      const key = `${region} - ${zone}`;
      if (!regionMap.has(key)) {
        regionMap.set(key, { region, zone, amount: 0, count: 0 });
      }
      const entry = regionMap.get(key);
      entry.amount += parseFloat(inv.total_invoice_value || 0);
      entry.count += 1;
    });
    const regionWise = Array.from(regionMap.values()).sort((a, b) => b.amount - a.amount);

    // Business Unit-wise aggregation
    const businessUnitMap = new Map();
    invoices.forEach(inv => {
      const unit = inv.business_unit || 'Unknown';
      if (!businessUnitMap.has(unit)) {
        businessUnitMap.set(unit, { businessUnit: unit, revenue: 0, count: 0 });
      }
      const entry = businessUnitMap.get(unit);
      entry.revenue += parseFloat(inv.total_invoice_value || 0);
      entry.count += 1;
    });
    const businessUnitWise = Array.from(businessUnitMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Customer-wise aggregation
    const customerMap = new Map();
    invoices.forEach(inv => {
      const customer = inv.customer_name || 'Unknown';
      if (!customerMap.has(customer)) {
        customerMap.set(customer, { customer, amount: 0, count: 0 });
      }
      const entry = customerMap.get(customer);
      entry.amount += parseFloat(inv.total_invoice_value || 0);
      entry.count += 1;
    });
    const customerWise = Array.from(customerMap.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 customers

    // Tax breakup
    const taxBreakup = {
      cgst: invoices.reduce((sum, inv) => sum + parseFloat(inv.cgst_output || 0), 0),
      sgst: invoices.reduce((sum, inv) => sum + parseFloat(inv.sgst_output || 0), 0),
      igst: invoices.reduce((sum, inv) => sum + parseFloat(inv.igst_output || 0), 0),
      ugst: invoices.reduce((sum, inv) => sum + parseFloat(inv.ugst_output || 0), 0),
      tcs: invoices.reduce((sum, inv) => sum + parseFloat(inv.tcs || 0), 0)
    };

    // Month-wise invoice trend
    const monthlyMap = new Map();
    invoices.forEach(inv => {
      if (inv.gst_tax_invoice_date) {
        const date = new Date(inv.gst_tax_invoice_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month: monthKey, amount: 0, count: 0 });
        }
        const entry = monthlyMap.get(monthKey);
        entry.amount += parseFloat(inv.total_invoice_value || 0);
        entry.count += 1;
      }
    });
    const monthlyTrends = Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Deduction vs Net Invoice comparison
    const deductionComparison = invoices.map(inv => {
      const totalDeductions = parseFloat(inv.it_tds_2_percent_service || 0) +
        parseFloat(inv.it_tds_1_percent_194q_supply || 0) +
        parseFloat(inv.lcess_boq_1_percent_works || 0) +
        parseFloat(inv.tds_2_percent_cgst_sgst || 0) +
        parseFloat(inv.tds_on_cgst_1_percent || 0) +
        parseFloat(inv.tds_on_sgst_1_percent || 0);
      const netInvoice = parseFloat(inv.total_invoice_value || 0) - totalDeductions;
      return {
        invoiceNo: inv.gst_tax_invoice_no || inv.internal_invoice_no,
        deductions: totalDeductions,
        netInvoice: netInvoice
      };
    }).filter(item => item.deductions > 0 || item.netInvoice > 0);

    // Reconciliation insights
    const reconciliation = {
      excessQty: invoices.reduce((sum, inv) => sum + parseFloat(inv.excess_supply_qty || 0), 0),
      shortage: 0, // Calculate based on business logic if needed
      lcDiscrepancy: invoices.reduce((sum, inv) => sum + parseFloat(inv.lc_discrepancy_charge || 0), 0),
      bankCharges: invoices.reduce((sum, inv) => sum + parseFloat(inv.bank_charges || 0), 0),
      interest: invoices.reduce((sum, inv) => sum + parseFloat(inv.interest_on_advance || 0), 0),
      otherExceptions: invoices
        .filter(inv => inv.any_hold && inv.any_hold.trim() !== '')
        .map(inv => ({
          invoiceNo: inv.gst_tax_invoice_no || inv.internal_invoice_no,
          hold: inv.any_hold,
          amount: parseFloat(inv.total_invoice_value || 0)
        }))
    };

    // Log dashboard summary for debugging
    console.log(`📊 Sales Invoice Dashboard data for user ${userId}:`, {
      totalInvoices: invoices.length,
      totalInvoiceAmount: summary.totalInvoiceAmount,
      netReceivables: summary.netReceivables,
      hasData: invoices.length > 0
    });

    res.json({
      success: true,
      data: {
        hasData: true,
        summary,
        invoices: invoices.slice(0, 100), // Limit for response size
        totalInvoices: invoices.length,
        regionWise,
        businessUnitWise,
        customerWise,
        taxBreakup,
        monthlyTrends,
        deductionComparison,
        reconciliation,
        availableOptions: {
          customers,
          businessUnits,
          regions,
          zones,
          invoiceTypes
        }
      },
      userId // Include userId in response for debugging
    });
  } catch (error) {
    console.error('Error fetching sales invoice dashboard:', error);
    throw error;
  }
});

