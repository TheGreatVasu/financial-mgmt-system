const { asyncHandler } = require('../middlewares/errorHandler');
const pdfService = require('../services/pdfService');
const { _buildDashboardPayload: buildDashboardPayload } = require('./dashboardController');

// Placeholder controllers - will be implemented later

const getReports = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get reports - Coming soon',
    data: []
  });
});

const getDSOReport = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'DSO report - Coming soon',
    data: []
  });
});

const getAgingReport = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Aging report - Coming soon',
    data: []
  });
});

// Generate PDF report for dashboard
const generatePDFReport = asyncHandler(async (req, res) => {
  try {
    const reportData = req.body || {};
    
    // Generate dashboard data if not provided
    const dashboardData = reportData.kpis ? reportData : await buildDashboardPayload();
    
    // Create PDF document
    const doc = pdfService.createDashboardPDF({
      ...dashboardData,
      generatedAt: reportData.generatedAt || new Date().toISOString(),
      filters: reportData.filters || {}
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-report-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
});

module.exports = {
  getReports,
  getDSOReport,
  getAgingReport,
  generatePDFReport
};
