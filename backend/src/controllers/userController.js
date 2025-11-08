const { asyncHandler } = require('../middlewares/errorHandler');
const { getAllUsers } = require('../services/userRepo');
const { adminMiddleware } = require('../middlewares/authMiddleware');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  
  res.json({
    success: true,
    data: users,
    count: users.length
  });
});

// @desc    Export users to Excel (Admin only)
// @route   GET /api/admin/users/export
// @access  Private/Admin
const exportUsers = asyncHandler(async (req, res) => {
  const ExcelJS = require('exceljs');
  const users = await getAllUsers();
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Financial Management System';
  workbook.created = new Date();
  
  const usersSheet = workbook.addWorksheet('Users');
  usersSheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Username', key: 'username', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Last Name', key: 'lastName', width: 15 },
    { header: 'Role', key: 'role', width: 10 },
    { header: 'Active', key: 'isActive', width: 10 },
    { header: 'Last Login', key: 'lastLogin', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Updated At', key: 'updatedAt', width: 20 }
  ];
  
  users.forEach(user => {
    usersSheet.addRow({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive ? 'Yes' : 'No',
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      createdAt: new Date(user.createdAt).toLocaleString(),
      updatedAt: new Date(user.updatedAt).toLocaleString()
    });
  });
  
  // Style header row
  usersSheet.getRow(1).font = { bold: true };
  usersSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.xlsx`);
  
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = {
  getAllUsersController,
  exportUsers
};

