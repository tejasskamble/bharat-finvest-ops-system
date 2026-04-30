const express = require('express');
const {
  getAttendance,
  markAttendance,
  updateAttendance,
  getAttendanceSummary
} = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAttendance);
router.post('/', markAttendance);
router.put('/:id', updateAttendance);
router.get('/summary', getAttendanceSummary);

module.exports = router;
