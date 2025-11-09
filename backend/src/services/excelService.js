const ExcelJS = require('exceljs');

// Excel service placeholder
class ExcelService {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
  }

  createInvoiceExcel(invoices) {
    const worksheet = this.workbook.addWorksheet('Invoices');
    
    // Add headers
    worksheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 15 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Issue Date', key: 'issueDate', width: 12 },
      { header: 'Due Date', key: 'dueDate', width: 12 },
      { header: 'Amount', key: 'totalAmount', width: 12 },
      { header: 'Paid', key: 'paidAmount', width: 12 },
      { header: 'Outstanding', key: 'outstandingAmount', width: 12 },
      { header: 'Status', key: 'status', width: 10 }
    ];
    
    // Add data
    invoices.forEach(invoice => {
      worksheet.addRow({
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customer.companyName,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        outstandingAmount: invoice.outstandingAmount,
        status: invoice.status
      });
    });
    
    return this.workbook;
  }

  createCustomerExcel(customers) {
    const worksheet = this.workbook.addWorksheet('Customers');
    
    worksheet.columns = [
      { header: 'Customer ID', key: 'customerId', width: 12 },
      { header: 'Company Name', key: 'companyName', width: 25 },
      { header: 'Contact Person', key: 'contactPerson', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];
    
    customers.forEach(customer => {
      worksheet.addRow({
        customerId: customer.customerId,
        companyName: customer.companyName,
        contactPerson: `${customer.contactPerson.firstName} ${customer.contactPerson.lastName}`,
        email: customer.contactPerson.email,
        phone: customer.contactPerson.phone,
        city: customer.address.city,
        status: customer.status
      });
    });
    
    return this.workbook;
  }

  createReportExcel(reportData) {
    const worksheet = this.workbook.addWorksheet('Report');
    
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 15 }
    ];
    
    Object.entries(reportData).forEach(([key, value]) => {
      worksheet.addRow({
        metric: key,
        value: value
      });
    });
    
    return this.workbook;
  }

  createPOEntryExcel(poData) {
    // Create a new workbook for this PO entry
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Customer PO Entry');

    // Define sections with their fields (matching the template structure)
    const sections = [
      {
        title: 'Customer Details',
        fields: [
          { key: 'customerName', label: 'Customer Name' },
          { key: 'customerAddress', label: 'Customer Address' },
          { key: 'state', label: 'State' },
          { key: 'country', label: 'Country' },
          { key: 'gstNo', label: 'GST No' },
          { key: 'businessType', label: 'Business Type' },
          { key: 'segment', label: 'Segment' },
          { key: 'zone', label: 'Zone' }
        ]
      },
      {
        title: 'Contract and Purchase Order Details',
        fields: [
          { key: 'contractAgreementNo', label: 'Contract Agreement No' },
          { key: 'caDate', label: 'CA Date' },
          { key: 'poNo', label: 'PO No' },
          { key: 'poDate', label: 'PO Date' },
          { key: 'letterOfIntentNo', label: 'Letter of Intent No' },
          { key: 'loiDate', label: 'LOI Date' },
          { key: 'letterOfAwardNo', label: 'Letter of Award No' },
          { key: 'loaDate', label: 'LOA Date' },
          { key: 'tenderReferenceNo', label: 'Tender Reference No' },
          { key: 'tenderDate', label: 'Tender Date' },
          { key: 'description', label: 'Description' }
        ]
      },
      {
        title: 'Payment and Guarantee Section',
        fields: [
          { key: 'paymentType', label: 'Payment Type' },
          { key: 'paymentTerms', label: 'Payment Terms' },
          { key: 'insuranceTypes', label: 'Insurance Types' },
          { key: 'advanceBankGuaranteeNo', label: 'Advance Bank Guarantee No' },
          { key: 'abgDate', label: 'ABG Date' },
          { key: 'performanceBankGuaranteeNo', label: 'Performance Bank Guarantee No' },
          { key: 'pbgDate', label: 'PBG Date' }
        ]
      },
      {
        title: 'Sales-Related Information',
        fields: [
          { key: 'salesManager', label: 'Sales Manager' },
          { key: 'salesHead', label: 'Sales Head' },
          { key: 'agentName', label: 'Agent Name' },
          { key: 'agentCommission', label: 'Agent Commission' }
        ]
      },
      {
        title: 'Additional Fields',
        fields: [
          { key: 'deliverySchedule', label: 'Delivery Schedule' },
          { key: 'liquidatedDamages', label: 'Liquidated Damages' },
          { key: 'poSignedConcernName', label: 'PO Signed Concern Name' },
          { key: 'boqAsPerPO', label: 'BOQ as per PO' }
        ]
      },
      {
        title: 'Financial Summary',
        fields: [
          { key: 'totalExWorks', label: 'Total Ex Works' },
          { key: 'freightAmount', label: 'Freight Amount' },
          { key: 'gst', label: 'GST' },
          { key: 'totalPOValue', label: 'Total PO Value' }
        ]
      }
    ];

    // Set column widths
    worksheet.getColumn('A').width = 35;
    worksheet.getColumn('B').width = 50;

    let currentRow = 1;

    // Helper function to apply section header style
    function applySectionHeaderStyle(cell) {
      cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }

    // Helper function to apply field title style
    function applyFieldTitleStyle(cell) {
      cell.font = { bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' }
      };
    }

    // Helper function to apply data cell style
    function applyDataCellStyle(cell) {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    }

    // Add title row
    const titleRow = worksheet.addRow(['CUSTOMER PURCHASE ORDER ENTRY FORM', '']);
    titleRow.height = 30;
    worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF000000' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' }
    };
    titleCell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    };
    currentRow++;

    // Add spacing
    currentRow++;

    // Process each section
    sections.forEach((section, sectionIndex) => {
      // Add section header
      const sectionRow = worksheet.addRow([section.title, '']);
      sectionRow.height = 25;
      worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
      const sectionCell = worksheet.getCell(`A${currentRow}`);
      applySectionHeaderStyle(sectionCell);
      currentRow++;

      // Add fields for this section
      section.fields.forEach((field) => {
        const fieldRow = worksheet.addRow([field.label, poData[field.key] || '']);
        fieldRow.height = 22;

        // Style field title (Column A)
        const fieldTitleCell = worksheet.getCell(`A${currentRow}`);
        applyFieldTitleStyle(fieldTitleCell);

        // Style data entry cell (Column B)
        const dataCell = worksheet.getCell(`B${currentRow}`);
        applyDataCellStyle(dataCell);

        currentRow++;
      });

      // Add spacing between sections (except after last section)
      if (sectionIndex < sections.length - 1) {
        currentRow++;
      }
    });

    return workbook;
  }
}

module.exports = new ExcelService();
