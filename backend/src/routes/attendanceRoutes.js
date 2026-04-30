const express = require('express');
const {
  getAttendance,
  markAttendance,
  updateAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAttendance);
router.post('/', allowRoles('admin', 'manager'), markAttendance);
router.put('/:id', allowRoles('admin', 'manager'), updateAttendance);
router.get('/summary', getAttendanceSummary);

module.exports = router;
