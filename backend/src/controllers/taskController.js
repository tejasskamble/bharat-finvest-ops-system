const pool = require('../config/db');

const sanitizeTaskPayload = (body = {}) => ({
  title: String(body.title || '').trim(),
  description: String(body.description || '').trim(),
  assigned_to: Number(body.assigned_to),
  assigned_by: Number(body.assigned_by),
  priority: body.priority || 'medium',
  status: body.status || 'pending',
  due_date: String(body.due_date || '').trim()
});

const isValidTaskPayload = (payload) => {
  return (
    payload.title &&
    Number.isInteger(payload.assigned_to) &&
    payload.assigned_to > 0 &&
    Number.isInteger(payload.assigned_by) &&
    payload.assigned_by > 0 &&
    payload.due_date
  );
};

const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assigned_to } = req.query;
    const conditions = [];
    const values = [];

    if (status) {
      conditions.push('t.status = ?');
      values.push(status);
    }
    if (priority) {
      conditions.push('t.priority = ?');
      values.push(priority);
    }
    if (assigned_to) {
      conditions.push('t.assigned_to = ?');
      values.push(assigned_to);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT t.*, e.name AS assignee_name, u.name AS assigner_name
       FROM tasks t
       INNER JOIN employees e ON e.id = t.assigned_to
       INNER JOIN users u ON u.id = t.assigned_by
       ${whereClause}
       ORDER BY t.due_date ASC, t.id DESC`,
      values
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM tasks`
    );

    return res.json({
      total: Number(rows[0].total || 0),
      pending: Number(rows[0].pending || 0),
      in_progress: Number(rows[0].in_progress || 0),
      completed: Number(rows[0].completed || 0)
    });
  } catch (error) {
    return next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const [rows] = await pool.query(
      `SELECT t.*, e.name AS assignee_name, u.name AS assigner_name
       FROM tasks t
       INNER JOIN employees e ON e.id = t.assigned_to
       INNER JOIN users u ON u.id = t.assigned_by
       WHERE t.id = ?`,
      [taskId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const payload = sanitizeTaskPayload(req.body);

    if (!isValidTaskPayload(payload)) {
      return res.status(400).json({ message: 'Required fields are missing or invalid' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (title, description, assigned_to, assigned_by, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.title,
        payload.description,
        payload.assigned_to,
        payload.assigned_by,
        payload.priority,
        payload.status,
        payload.due_date
      ]
    );

    const [rows] = await pool.query(
      `SELECT t.*, e.name AS assignee_name, u.name AS assigner_name
       FROM tasks t
       INNER JOIN employees e ON e.id = t.assigned_to
       INNER JOIN users u ON u.id = t.assigned_by
       WHERE t.id = ?`,
      [result.insertId]
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(422).json({ message: 'Assigned employee or assigner user does not exist' });
    }
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const payload = sanitizeTaskPayload(req.body);
    if (!isValidTaskPayload(payload)) {
      return res.status(400).json({ message: 'Required fields are missing or invalid' });
    }

    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await pool.query(
      `UPDATE tasks
       SET title = ?, description = ?, assigned_to = ?, assigned_by = ?, priority = ?, status = ?, due_date = ?
       WHERE id = ?`,
      [
        payload.title,
        payload.description,
        payload.assigned_to,
        payload.assigned_by,
        payload.priority,
        payload.status,
        payload.due_date,
        taskId
      ]
    );

    const [rows] = await pool.query(
      `SELECT t.*, e.name AS assignee_name, u.name AS assigner_name
       FROM tasks t
       INNER JOIN employees e ON e.id = t.assigned_to
       INNER JOIN users u ON u.id = t.assigned_by
       WHERE t.id = ?`,
      [taskId]
    );
    return res.json(rows[0]);
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(422).json({ message: 'Assigned employee or assigner user does not exist' });
    }
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const [existing] = await pool.query('SELECT id FROM tasks WHERE id = ?', [taskId]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [taskId]);
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
