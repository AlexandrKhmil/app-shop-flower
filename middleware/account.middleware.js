const jwt = require('jsonwebtoken');
const jwtSecret = require('config').get('jwtSecret');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(500).json({ msg: 'token1' });
    }
    const decoded = jwt.verify(token, jwtSecret);
    req.token = decoded;
    next();
  } catch (e) {
    res.status(500).json({ msg: 'token2' });
  }
};