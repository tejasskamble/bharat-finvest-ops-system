const pool = require('../config/db');

const getEmployees = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const offset = (page - 1) * limit;

    const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM employees');
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT id, user_id, employee_code, name, email, phone, department, designation, date_of_joining, status, created_at
       FROM employees
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
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
    const {
      user_id,
      employee_code,
      name,
      email,
      phone,
      department,
      designation,
      date_of_joining,
      status
    } = req.body;

    if (!employee_code || !name || !email || !phone || !department || !designation || !date_of_joining) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees (user_id, employee_code, name, email, phone, department, designation, date_of_joining, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id || null, employee_code, name, email, phone, department, designation, date_of_joining, status || 'active']
    );

    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
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
    const {
      user_id,
      employee_code,
      name,
      email,
      phone,
      department,
      designation,
      date_of_joining,
      status
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await pool.query(
      `UPDATE employees
       SET user_id = ?, employee_code = ?, name = ?, email = ?, phone = ?, department = ?, designation = ?, date_of_joining = ?, status = ?
       WHERE id = ?`,
      [
        user_id || null,
        employee_code,
        name,
        email,
        phone,
        department,
        designation,
        date_of_joining,
        status || 'active',
        employeeId
      ]
    );

    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [employeeId]);
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
