const jwt = require('jsonwebtoken');
const jwtSecret = require('config').get('jwtSecret');

module.exports = (id) => jwt.sign(
  { id },
  jwtSecret,
  // { expiresIn: '1h' },
);