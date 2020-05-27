const GET = `
  select avg(Rate.value) as rate
  from Rate
    inner join Product on Rate.productId = Product.id
  where Product.link = $1;
`;

const DELETE = `
  delete from Rate
  where accountId = $<accountId>
    and productId in (select id from Product where link = $<link>);
`;

module.exports = {
  GET,
  DELETE,
};