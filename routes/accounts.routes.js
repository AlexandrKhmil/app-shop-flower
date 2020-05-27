const { Router } = require('express');
const router = Router();
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');

const db = require('../connection');
const queryAccount = require('../sql/account');

const account = require('../middleware/account.middleware');
const error = require('../middleware/error.middleware');

const signToken = require('../functions/signToken');

// GET `api/accounts/auth`
router.get(
  '/auth',
  account,
  async (req, res) => {
    try {
      const { id } = req.token;

      const result = await db.one(queryAccount.SELECT_EMAIL_BY_ID, id)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error', error: result.error });
      }

      return res.status(200).json(result);
    } catch (error) { 
      return res.status(500).json({ message: 'Error' });
    }
  }
);

// POST `api/accounts/login`
router.post(
  '/login', 
  [ 
    body('email', 'Error').normalizeEmail().isEmail(),
    body('password', 'Error').isLength({ min: 5 })
  ],
  error,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await db.one(queryAccount.SELECT_USER_BY_EMAIL, email)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error', error: result.error, });
      }

      const isMatch = await bcrypt.compare(password, result.password);
      if (!isMatch) {
        return res.status(500).json({ msg: 'Error' });
      }

      const token = signToken(result.id);
      return res.status(200).json({ token, email });
    } catch (error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// POST `api/accounts/registration`
router.post(
  '/registration', 
  [
    body('email', 'Error').normalizeEmail().isEmail(),
    body('password', 'Error').isLength({ min: 5 })
  ],
  error,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);

      const result = await db.func('account_add_func', [email, hashedPassword])
        .then((data) => data[0].account_add_func)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error', error: result.error });
      }

      const token = signToken(result);

      return res.status(200).json({ token, email });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// POST 'api/accounts/change-password'
router.post(
  '/change-password',
  account,
  [
    body('password_old', 'Error').isLength({ min: 5 }),
    body('password_new', 'Error').isLength({ min: 5 })
  ],
  error,
  async (req, res) => {
    try {
      const { password_old, password_new } = req.body;
      const { id } = req.token;

      const result = await db.one(queryAccount.SELECT_PASSWORD, id)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error', error: result.error });
      }

      const isMatch = await bcrypt.compare(password_old, result.password);
      if (!isMatch) {
        return res.status(500).json({ msg: 'Error' });
      }

      const hashedPassword = await bcrypt.hash(password_new, 12);

      await db.none(queryAccount.UPDATE_PASSWORD, [hashedPassword, id])
        .then(() => res.status(200).json('Ok'))
        .catch((error) => res.status(500).json({ msg: 'Error', error }));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
)

module.exports = router;