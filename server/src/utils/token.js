const jwt = require('jsonwebtoken');

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_TTL || '7d',
  });

module.exports = { signToken };
