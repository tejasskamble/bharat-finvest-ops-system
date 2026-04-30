const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', async (req, res, next) => {
  try {
    const [employeeRows] = await pool.query(
      `SELECT
         COUNT(*) AS totalEmployees,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeEmployees
       FROM employees`
    );

    const [taskRows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM tasks`
    );

    const [attendanceRows] = await pool.query(
      `SELECT
         SUM(CASE WHEN status IN ('present', 'half_day') THEN 1 ELSE 0 END) AS present,
         SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent,
         COUNT(*) AS total
       FROM attendance
       WHERE date = CURDATE()`
    );

    const attendanceToday = {
      present: Number(attendanceRows[0].present || 0),
      absent: Number(attendanceRows[0].absent || 0),
      total: Number(attendanceRows[0].total || 0)
    };

    const attendancePercent = attendanceToday.total
      ? Number(((attendanceToday.present / attendanceToday.total) * 100).toFixed(2))
      : 0;

    return res.json({
      totalEmployees: Number(employeeRows[0].totalEmployees || 0),
      activeEmployees: Number(employeeRows[0].activeEmployees || 0),
      taskStats: {
        total: Number(taskRows[0].total || 0),
        pending: Number(taskRows[0].pending || 0),
        in_progress: Number(taskRows[0].in_progress || 0),
        completed: Number(taskRows[0].completed || 0)
      },
      attendanceToday,
      attendancePercent
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
