const express = require('express');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  fetchMasterData,
  submitMasterData,
  updateCompanyProfile,
  updateCustomerProfile,
  updatePaymentTerms,
  updateTeamProfiles,
  updateAdditionalStep,
  fetchStatus,
} = require('../controllers/masterDataController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', fetchMasterData);
router.post('/', submitMasterData);
router.put('/company-profile', updateCompanyProfile);
router.put('/customer-profile', updateCustomerProfile);
router.put('/payment-terms', updatePaymentTerms);
router.put('/team-profiles', updateTeamProfiles);
router.put('/additional-step', updateAdditionalStep);
router.get('/status', fetchStatus);

module.exports = router;

