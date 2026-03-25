const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mydrive',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE) || 10,
  ssl:
    process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
});

const query = async (text, params = []) => {
  try {
    const [result] = await pool.execute(text, params);
    if (Array.isArray(result)) {
      return { rows: result, rowCount: result.length };
    }
    return {
      rows: [],
      rowCount: result.affectedRows || 0,
      insertId: result.insertId,
    };
  } catch (error) {
    logger.error(`MySQL query failed: ${error.message}`);
    throw error;
  }
};

module.exports = { pool, query };
