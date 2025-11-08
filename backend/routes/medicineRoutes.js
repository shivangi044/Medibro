const express = require('express');
const router = express.Router();
const {
  addMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getLowStockMedicines
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');
const {
  addMedicineValidation,
  validate,
  objectIdValidation
} = require('../middleware/validator');

// All routes are protected (require authentication)
router.use(protect);

// Medicine CRUD routes
router.route('/')
  .get(getMedicines)
  .post(addMedicineValidation, validate, addMedicine);

router.route('/:id')
  .get(objectIdValidation('id'), validate, getMedicineById)
  .put(objectIdValidation('id'), validate, updateMedicine)
  .delete(objectIdValidation('id'), validate, deleteMedicine);

// Alert routes
router.get('/alerts/low-stock', getLowStockMedicines);

module.exports = router;
