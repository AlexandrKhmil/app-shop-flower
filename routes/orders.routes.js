const { Router } = require('express');
const router = Router();
const { body } = require('express-validator');

const db = require('../connection');
const queryOrder = require('../sql/order');

const account = require('../middleware/account.middleware');
const error = require('../middleware/error.middleware');

// POST '/api/orders/' [ {"productid" : 2, "quantity" : 99} ]
router.post(
  '/',
  account,
  [ 
    body('cart', 'Cart').isArray(),
    body('address', 'Address').exists(),
    body('phone', 'Phone').exists(), 
  ],
  error,
  async (req, res) => {
    try {
      const accountid = req.token.id;
      const id = require('shortid').generate();
      const { cart, address, phone } = req.body;

      await db.func(
          'order_add_func', 
          [id, accountid, JSON.stringify(cart), address, phone]
        )
        .then(() => res.status(200).json({ msg: 'Ok', id }))
        .catch((error) => res.status(500).json({ msg: 'Error', error }));
    } catch(error) {
      return res.status(500).json({ msg: 'Error' });
    }
  }
);

// GET '/api/orders/list'
router.get(
  '/list',
  account,
  async (req, res) => {
    try {
      const accountid = req.token.id;

      const result = await db.any(queryOrder.SELECT_LIST, accountid)
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

module.exports = router;