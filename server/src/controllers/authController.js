const { v4: uuid } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/token');
const { logger } = require('../utils/logger');

const buildUserPayload = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const normalizedEmail = email.toLowerCase();

  const existing = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing.rows.length) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await hashPassword(password);
  const id = uuid();

  await query(`INSERT INTO users (id, name, email, password_hash) VALUES (?,?,?,?)`, [
    id,
    name.trim(),
    normalizedEmail,
    passwordHash,
  ]);

  const { rows } = await query(`SELECT id, name, email FROM users WHERE id = ?`, [id]);
  const user = rows[0];
  logger.info(`New user created: ${user.email}`);

  const token = signToken({ id: user.id });

  res.status(201).json({ user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const { rows } = await query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
  if (!rows.length) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const userRecord = rows[0];
  const isValid = await comparePassword(password, userRecord.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const user = buildUserPayload(userRecord);
  const token = signToken({ id: user.id });

  res.json({ user, token });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  signup,
  login,
  me,
};
