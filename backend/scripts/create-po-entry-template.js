const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Create a new workbook
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Customer PO Entry');

// Define sections with their fields
const sections = [
  {
    title: 'Customer Details',
    fields: [
      'Customer Name',
      'Customer Address',
      'State',
      'Country',
      'GST No',
      'Business Type',
      'Segment',
      'Zone'
    ]
  },
  {
    title: 'Contract and Purchase Order Details',
    fields: [
      'Contract Agreement No',
      'CA Date',
      'PO No',
      'PO Date',
      'Letter of Intent No',
      'LOI Date',
      'Letter of Award No',
      'LOA Date',
      'Tender Reference No',
      'Tender Date',
      'Description'
    ]
  },
  {
    title: 'Payment and Guarantee Section',
    fields: [
      'Payment Type',
      'Payment Terms',
      'Insurance Types',
      'Advance Bank Guarantee No',
      'ABG Date',
      'Performance Bank Guarantee No',
      'PBG Date'
    ]
  },
  {
    title: 'Sales-Related Information',
    fields: [
      'Sales Manager',
      'Sales Head',
      'Agent Name',
      'Agent Commission'
    ]
  },
  {
    title: 'Additional Fields',
    fields: [
      'Delivery Schedule',
      'Liquidated Damages',
      'PO Signed Concern Name',
      'BOQ as per PO'
    ]
  },
  {
    title: 'Financial Summary',
    fields: [
      'Total Ex Works',
      'Freight Amount',
      'GST',
      'Total PO Value'
    ]
  }
];

// Set column widths
worksheet.getColumn('A').width = 35; // Field titles column
worksheet.getColumn('B').width = 50; // Data entry column

let currentRow = 1;

// Helper function to apply section header style
function applySectionHeaderStyle(cell) {
  cell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' } // Subtle blue shading
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
    fgColor: { argb: 'FFF2F2F2' } // Very light gray
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
  section.fields.forEach((field, fieldIndex) => {
    const fieldRow = worksheet.addRow([field, '']);
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

// Freeze the first row (title)
worksheet.views = [
  {
    state: 'frozen',
    ySplit: 1
  }
];

// Protect the sheet structure but allow data entry
worksheet.protect('', {
  selectLockedCells: false,
  selectUnlockedCells: true,
  formatCells: false,
  formatColumns: false,
  formatRows: false,
  insertColumns: false,
  insertRows: false,
  insertHyperlinks: false,
  deleteColumns: false,
  deleteRows: false,
  sort: false,
  autoFilter: false,
  pivotTables: false
});

// Save the workbook
const outputDir = path.join(__dirname, '../templates');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'Customer_PO_Entry_Template.xlsx');

workbook.xlsx.writeFile(outputPath)
  .then(() => {
    console.log('✅ Customer PO Entry Template created successfully!');
    console.log(`📁 File saved at: ${outputPath}`);
    console.log('\n📋 Template includes:');
    console.log('   - Professional formatting with section headers');
    console.log('   - Bold field titles in Column A');
    console.log('   - Blank data entry cells in Column B');
    console.log('   - Subtle shading and borders');
    console.log('   - All required fields organized by sections');
  })
  .catch((error) => {
    console.error('❌ Error creating template:', error);
    process.exit(1);
  });

