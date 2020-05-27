const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ msg: 'Error', errorList: errors.array() });
    }
    next();
  } catch (e) {
    return res.status(500).json({ msg: 'Error' });
  }
};