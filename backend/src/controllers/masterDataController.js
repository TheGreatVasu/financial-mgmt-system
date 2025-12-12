const asyncHandler = require('express-async-handler');
const {
  getMasterData,
  saveMasterData,
  mergeSection,
  getStatus,
} = require('../services/masterDataRepo');
const { getDb } = require('../config/db');
const { syncMasterDataToCustomers } = require('../services/masterDataRepo');

function requireUser(req) {
  const userId = req.user?.id;
  if (!userId) {
    const err = new Error('Authentication required');
    err.statusCode = 401;
    throw err;
  }
  return userId;
}

const fetchMasterData = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const data = await getMasterData(userId);
  res.json({ success: true, data });
});

const submitMasterData = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const payload = req.body || {};
  
  // Save master data
  const saved = await saveMasterData(userId, payload);
  
  // Sync customer profile from master data to customers table
  if (payload.customerProfile) {
    try {
      await syncMasterDataToCustomers(userId, payload);
    } catch (syncError) {
      console.error('Error syncing master data to customers:', syncError);
      // Don't fail the request if sync fails, just log it
    }
  }
  
  res.json({ success: true, data: saved, message: 'Master data saved and synced successfully' });
});

const updateSection = (sectionKey) =>
  asyncHandler(async (req, res) => {
    const userId = requireUser(req);
    const payload = req.body || {};
    const saved = await mergeSection(userId, sectionKey, payload);
    res.json({ success: true, data: saved[sectionKey] || {}, full: saved });
  });

const fetchStatus = asyncHandler(async (req, res) => {
  const userId = requireUser(req);
  const status = await getStatus(userId);
  res.json({ success: true, data: status });
});

module.exports = {
  fetchMasterData,
  submitMasterData,
  updateCompanyProfile: updateSection('companyProfile'),
  updateCustomerProfile: updateSection('customerProfile'),
  updatePaymentTerms: updateSection('paymentTerms'),
  updateTeamProfiles: updateSection('teamProfiles'),
  updateAdditionalStep: updateSection('additionalStep'),
  fetchStatus,
};

