const SELECT_LIST = `
  select 
    CustomerOrder.id,
    CustomerOrder.address,
    CustomerOrder.phone,
    CustomerOrder.status,
    CustomerOrder.totalPrice,
    CustomerOrder.postedAt,
    CustomerOrder.completedAt,
    (
      select json_agg(T)
      from (
        select 
          Product.title,
          Product.link,
          OrderList.quantity
        from OrderList
          inner join Product on productId = Product.id
        where orderId = CustomerOrder.id
      ) as T
    ) as productsList
  from CustomerOrder
  where accountId = $1;
`;

module.exports = {
  SELECT_LIST,
};