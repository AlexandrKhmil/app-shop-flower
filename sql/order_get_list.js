module.exports = `
  SELECT 
  o.code,
  o.status,
  o.total_price,
  o.create_time,
  o.update_time,
  (SELECT json_agg(t)
  FROM (SELECT p.title, p.link, quantity
        FROM order_has_product
          INNER JOIN product AS p ON p.id = product_id
        WHERE order_id = o.id) AS t) AS product_list
  FROM customer_order AS o
  WHERE account_id = $1;
`;