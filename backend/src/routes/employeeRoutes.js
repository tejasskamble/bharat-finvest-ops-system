const express = require('express');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', allowRoles('admin', 'manager'), createEmployee);
router.put('/:id', allowRoles('admin', 'manager'), updateEmployee);
router.delete('/:id', allowRoles('admin'), deleteEmployee);

module.exports = router;
