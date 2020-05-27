const SELECT = `
  select
    Review.id,
    Review.text,
    Account.email,
    Review.postedAt,
    Review.changedAt
  from Review
    inner join Account on Review.accountId = Account.id
    inner join Product on Review.productId = Product.id 
  where Product.link = $1
  group by Review.id, Account.email;
`;

const DELETE = `
  delete from Review
  where accountId = $<accountId> 
    and productId in (select id from Product where link = $<link>)
`;

module.exports = {
  SELECT,
  DELETE,
};