const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/actionItemsController');

router.use(authMiddleware);

router.get('/', ctrl.list);
router.post('/', ctrl.validateCreate, ctrl.create);
router.post('/bulk', ctrl.bulkCreateFromMom);
router.put('/:id', ctrl.update);

module.exports = router;


