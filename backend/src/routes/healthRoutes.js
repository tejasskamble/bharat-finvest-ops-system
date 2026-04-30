const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'OK',
      service: 'Bharat Finvest Backend',
      database: 'connected',
      timestamp
    });
  } catch (error) {
    return res.status(503).json({
      status: 'ERROR',
      service: 'Bharat Finvest Backend',
      database: 'disconnected',
      timestamp
    });
  }
});

module.exports = router;

