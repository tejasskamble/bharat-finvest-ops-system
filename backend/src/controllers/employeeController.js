const pool = require('../config/db');

const sanitizeEmployeePayload = (body = {}) => ({
  user_id: body.user_id || null,
  employee_code: String(body.employee_code || '').trim(),
  name: String(body.name || '').trim(),
  email: String(body.email || '').trim(),
  phone: String(body.phone || '').trim(),
  department: String(body.department || '').trim(),
  designation: String(body.designation || '').trim(),
  date_of_joining: String(body.date_of_joining || '').trim(),
  status: body.status || 'active'
});

const validateEmployeePayload = (payload) => {
  return (
    payload.employee_code &&
    payload.name &&
    payload.email &&
    payload.phone &&
    payload.department &&
    payload.designation &&
    payload.date_of_joining
  );
};

const getEmployees = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();

    const filters = [];
    const filterValues = [];

    if (search) {
      const like = `%${search}%`;
      filters.push('(employee_code LIKE ? OR name LIKE ? OR email LIKE ? OR department LIKE ? OR designation LIKE ?)');
      filterValues.push(like, like, like, like, like);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM employees ${whereClause}`, filterValues);
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT id, user_id, employee_code, name, email, phone, department, designation, date_of_joining, status, created_at
       FROM employees
       ${whereClause}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...filterValues, limit, offset]
    );

    return res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const [employeeRows] = await pool.query(
      `SELECT id, user_id, employee_code, name, email, phone, department, designation, date_of_joining, status, created_at
       FROM employees
       WHERE id = ?`,
      [employeeId]
    );

    if (employeeRows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const [taskRows] = await pool.query(
      'SELECT COUNT(*) AS task_count FROM tasks WHERE assigned_to = ?',
      [employeeId]
    );

    const [attendanceRows] = await pool.query(
      `SELECT
         COUNT(*) AS total_days,
         SUM(CASE WHEN status = 'present' THEN 1 WHEN status = 'half_day' THEN 0.5 ELSE 0 END) AS attended_units
       FROM attendance
       WHERE employee_id = ?`,
      [employeeId]
    );

    const totalDays = Number(attendanceRows[0].total_days || 0);
    const attendedUnits = Number(attendanceRows[0].attended_units || 0);
    const attendancePercent = totalDays > 0 ? Number(((attendedUnits / totalDays) * 100).toFixed(2)) : 0;

    return res.json({
      ...employeeRows[0],
      taskCount: Number(taskRows[0].task_count || 0),
      attendancePercent
    });
  } catch (error) {
    return next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const payload = sanitizeEmployeePayload(req.body);

    if (!validateEmployeePayload(payload)) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees (user_id, employee_code, name, email, phone, department, designation, date_of_joining, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.user_id,
        payload.employee_code,
        payload.name,
        payload.email,
        payload.phone,
        payload.department,
        payload.designation,
        payload.date_of_joining,
        payload.status
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, user_id, employee_code, name, email, phone, department, designation, date_of_joining, status, created_at
       FROM employees
       WHERE id = ?`,
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Employee code or email already exists' });
    }
    return next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const payload = sanitizeEmployeePayload(req.body);
    if (!validateEmployeePayload(payload)) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await pool.query(
      `UPDATE employees
       SET user_id = ?, employee_code = ?, name = ?, email = ?, phone = ?, department = ?, designation = ?, date_of_joining = ?, status = ?
       WHERE id = ?`,
      [
        payload.user_id,
        payload.employee_code,
        payload.name,
        payload.email,
        payload.phone,
        payload.department,
        payload.designation,
        payload.date_of_joining,
        payload.status,
        employeeId
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, user_id, employee_code, name, email, phone, department, designation, date_of_joining, status, created_at
       FROM employees
       WHERE id = ?`,
      [employeeId]
    );
    return res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Employee code or email already exists' });
    }
    return next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.id, 10);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await pool.query(`UPDATE employees SET status = 'inactive' WHERE id = ?`, [employeeId]);
    return res.json({ message: 'Employee marked as inactive' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
