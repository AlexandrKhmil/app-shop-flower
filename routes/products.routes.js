const { Router } = require('express');
const router = Router();
const { body } = require('express-validator');

const db = require('../connection');
const queryProduct = require('../sql/product');
const queryRate = require('../sql/rate');
const queryReview = require('../sql/review');

const account = require('../middleware/account.middleware');
const error = require('../middleware/error.middleware');

// GET 'api/products/list'
router.get(
  '/list',
  async (req, res) => {
    try {
      const { limit, offset } = req.headers;

      const result = await db
        .any(queryProduct.GET_LIST(req.headers), { limit, offset })
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error1', error: result.error });
      }

      return res.status(200).json(result);
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// GET 'api/products/categories/'
router.get(
  '/categories',
  async (req, res) => {
    try {
      const result = await db.any(queryProduct.GET_CATEGORIES)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error1', error: result.error });
      }

      return res.status(200).json(result.map((category) => category.category));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// GET 'api/product/groups/'
router.get(
  '/groups',
  async (req, res) => {
    try {
      const result = await db.any(queryProduct.GET_GROUPS)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error1', error: result.error });
      }

      return res.status(200).json(result.map((tag) => tag.tag));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// GET 'api/products/{link}/info/'
router.get(
  '/:link/info',
  async (req, res) => {
    try {
      const { link } = req.params;

      const result = await db.one(queryProduct.GET_ITEM, link)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        console.log(result.error);
        return res.status(500).json({ msg: 'Error', error: result.error });
      }

      return res.status(200).json(result);
    } catch(error) {
      return res.status(500).json({ msg: 'Error1' });
    }
  }
);

// GET 'api/product/{link}/rate/value
router.get(
  '/:link/rate/value',
  async (req, res) => {
    try {
      const { link } = req.params;

      const result = await db.one(queryRate.GET, link)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error', error: result.error });
      }

      return res.status(200).json(result);
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// POST 'api/product/{link}/rate'
router.post(
  '/:link/rate',
  account, 
  [ body('value', 'Error').isInt({ min: 1, max: 5}) ],
  error,
  async (req, res) => {
    try {
      const { link } = req.params;
      const { value } = req.body;
      const accountId = req.token.id;

      await db.func('product_rate_func', [accountId, link, value])
        .then(() => res.status(200).json({ msg: 'Ok' }))
        .catch((error) => res.status(500).json({ msg: 'Error', error }));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// DELETE 'api/products/{link}/rate'
router.delete(
  '/:link/rate', 
  account,
  async (req, res) => {
    try {
      const { link } = req.params;
      const accountId = req.token.id;

      await db.none(queryRate.DELETE, { accountId, link })
        .then(() => res.status(200).json({ msg: 'Ok' }))
        .catch((error) => res.status(500).json({ msg: 'Error', error }));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// GET 'api/product/{link}/review/list'
router.get(
  '/:link/review/list',
  async (req, res) => {
    try {
      const { link } = req.params;

      const result = await db.any(queryReview.SELECT, link)
        .then((data) => data)
        .catch((error) => ({ error }));
      if (result.error) {
        return res.status(500).json({ msg: 'Error', error: result.error });
      }
  
      return res.status(200).json(result);
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
)

// POST 'api/product/{link}/review'
router.post(
  '/:link/review', 
  account, 
  [ body('text', 'Text').isLength({ min: 5 }) ],
  error,
  async (req, res) => {
    try {
      const { link } = req.params;
      const accountId = req.token.id;
      const { text } = req.body;

      db.func('review_add_func', [link, accountId, text])
        .then(() => res.status(200).json({ msg: 'OK' }))
        .catch((error) => res.status(500).json({ msg: 'Error', error }));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// DELETE 'api/product/{link}/review'
router.delete(
  '/:link/review',
  account,
  async (req, res) => {
    try {
      const { link } = req.params;
      const accountId = req.token.id;

      await db.none(queryReview.DELETE, { accountId, link })
        .then(() => res.status(200).json({ msg: 'Ok' }))
        .catch((error) => res.status(500).json({ msg: 'Error', error }));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

module.exports = router;