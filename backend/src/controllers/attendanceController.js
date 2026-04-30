const pool = require('../config/db');

const sanitizeAttendancePayload = (body = {}) => ({
  employee_id: Number(body.employee_id),
  date: String(body.date || '').trim(),
  check_in: body.check_in || null,
  check_out: body.check_out || null,
  status: body.status || 'present'
});

const validateAttendancePayload = (payload) => {
  return Number.isInteger(payload.employee_id) && payload.employee_id > 0 && payload.date;
};

const getAttendance = async (req, res, next) => {
  try {
    const { employee_id, from, to } = req.query;
    const conditions = [];
    const values = [];

    if (employee_id) {
      const employeeIdNumber = Number(employee_id);
      if (!Number.isInteger(employeeIdNumber) || employeeIdNumber <= 0) {
        return res.status(400).json({ message: 'employee_id must be a valid number' });
      }
      conditions.push('a.employee_id = ?');
      values.push(employeeIdNumber);
    }
    if (from) {
      conditions.push('a.date >= ?');
      values.push(from);
    }
    if (to) {
      conditions.push('a.date <= ?');
      values.push(to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT a.*, e.name AS employee_name, e.employee_code, e.department
       FROM attendance a
       INNER JOIN employees e ON e.id = a.employee_id
       ${whereClause}
       ORDER BY a.date DESC, a.employee_id ASC`,
      values
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const payload = sanitizeAttendancePayload(req.body);

    if (!validateAttendancePayload(payload)) {
      return res.status(400).json({ message: 'employee_id and date are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
       VALUES (?, ?, ?, ?, ?)`,
      [payload.employee_id, payload.date, payload.check_in, payload.check_out, payload.status]
    );

    const [rows] = await pool.query(
      `SELECT a.*, e.name AS employee_name, e.employee_code, e.department
       FROM attendance a
       INNER JOIN employees e ON e.id = a.employee_id
       WHERE a.id = ?`,
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Attendance already marked for this employee on this date' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(422).json({ message: 'Employee does not exist' });
    }
    return next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const attendanceId = parseInt(req.params.id, 10);
    if (Number.isNaN(attendanceId)) {
      return res.status(400).json({ message: 'Invalid attendance id' });
    }

    const payload = sanitizeAttendancePayload(req.body);
    if (!validateAttendancePayload(payload)) {
      return res.status(400).json({ message: 'employee_id and date are required' });
    }

    const [existing] = await pool.query('SELECT id FROM attendance WHERE id = ?', [attendanceId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await pool.query(
      `UPDATE attendance
       SET employee_id = ?, date = ?, check_in = ?, check_out = ?, status = ?
       WHERE id = ?`,
      [payload.employee_id, payload.date, payload.check_in, payload.check_out, payload.status, attendanceId]
    );

    const [rows] = await pool.query(
      `SELECT a.*, e.name AS employee_name, e.employee_code, e.department
       FROM attendance a
       INNER JOIN employees e ON e.id = a.employee_id
       WHERE a.id = ?`,
      [attendanceId]
    );
    return res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Attendance already exists for this employee on this date' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(422).json({ message: 'Employee does not exist' });
    }
    return next(error);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const month = req.query.month;
    let startDate;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      startDate = `${month}-01`;
    } else {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      startDate = `${yyyy}-${mm}-01`;
    }

    const [rows] = await pool.query(
      `SELECT
         e.id AS employee_id,
         e.name AS employee_name,
         e.department,
         COUNT(a.id) AS total_records,
         SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
         SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) AS half_day_count,
         SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) AS leave_count,
         ROUND(
           (SUM(CASE WHEN a.status = 'present' THEN 1 WHEN a.status = 'half_day' THEN 0.5 ELSE 0 END) / NULLIF(COUNT(a.id), 0)) * 100,
           2
         ) AS attendance_percent
       FROM employees e
       LEFT JOIN attendance a ON a.employee_id = e.id AND a.date BETWEEN ? AND LAST_DAY(?)
       GROUP BY e.id, e.name, e.department
       ORDER BY e.name ASC`,
      [startDate, startDate]
    );

    return res.json({
      month: startDate.substring(0, 7),
      summary: rows.map((row) => ({
        ...row,
        total_records: Number(row.total_records || 0),
        present_count: Number(row.present_count || 0),
        absent_count: Number(row.absent_count || 0),
        half_day_count: Number(row.half_day_count || 0),
        leave_count: Number(row.leave_count || 0),
        attendance_percent: Number(row.attendance_percent || 0)
      }))
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  updateAttendance,
  getAttendanceSummary
};
