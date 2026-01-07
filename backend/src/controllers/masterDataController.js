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
  
  // Allow partial saves - merge with existing data if present
  try {
    // Get existing master data to merge with
    const existing = await getMasterData(userId) || {};
    const mergedData = {
      ...existing,
      // Merge nested objects instead of replacing
      companyProfile: payload.companyProfile 
        ? { ...(existing.companyProfile || {}), ...payload.companyProfile }
        : existing.companyProfile,
      customerProfile: payload.customerProfile 
        ? { ...(existing.customerProfile || {}), ...payload.customerProfile }
        : existing.customerProfile,
      consigneeProfiles: payload.consigneeProfiles !== undefined 
        ? payload.consigneeProfiles 
        : (existing.consigneeProfiles || []),
      payerProfiles: payload.payerProfiles !== undefined 
        ? payload.payerProfiles 
        : (existing.payerProfiles || []),
      paymentTerms: payload.paymentTerms !== undefined 
        ? payload.paymentTerms 
        : (existing.paymentTerms || []),
      teamProfiles: payload.teamProfiles !== undefined 
        ? payload.teamProfiles 
        : (existing.teamProfiles || []),
      additionalStep: payload.additionalStep 
        ? { ...(existing.additionalStep || {}), ...payload.additionalStep }
        : existing.additionalStep,
    };
    
    // Save merged master data
    const saved = await saveMasterData(userId, mergedData);
    
    // Sync customer profile from master data to customers table (only if customerProfile exists and has customerName)
    let syncResult = null;
    if (mergedData.customerProfile && (mergedData.customerProfile.customerName || mergedData.customerProfile.legalEntityName)) {
      try {
        syncResult = await syncMasterDataToCustomers(userId, mergedData);
      } catch (syncError) {
        console.error('Error syncing master data to customers:', syncError);
        // Don't fail the request if sync fails, just log it
      }
    }
    
    res.json({ 
      success: true, 
      data: saved, 
      syncResult,
      message: 'Master data saved successfully' 
    });
  } catch (error) {
    console.error('Error saving master data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save master data'
    });
  }
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

