const touple = require('../functions/touple');

const GET_LIST = ({
  category,
  groupsList,
  title,
  pricemin,
  pricemax,
  sort,
  sortway,
}) => {
  const groupsTouple = groupsList && touple(groupsList);
  const titleSample = title && `'%${title}%'`;
  let sortSQL = sort === 'price' ? 'Product.price' : 'Product.createdAt';
  sortSQL += sortway === 'desc' ? ' desc' : ' asc';
  return `
    select distinct
      Product.id, 
      Product.title, 
      Product.price,
      Product.discountPrice,
      Product.link,
      Product.imgURL,
      Product.category,
      Product.createdAt,
      avg(Rate.value) AS rate,
      count(Rate.*) AS votesCount,
      count(Review.*) AS reviewsCount,
      array(
        select productGroup
        from ProductGroup
        where productId = Product.id
      ) AS productGroups
    from Product
      left join Rate on Product.id = Rate.productId
      left join Review on Product.id = Review.ProductId
      ${groupsTouple ? 'left join ProductGroup on ProductGroup.productId = Product.id' : ''}
    where Product.status = 'default'
      ${category ? `and Product.category = '${category}'` : ''}
      ${groupsTouple ? `and productGroup in ${groupsTouple}` : ''}
      ${titleSample ? `and Product.title like ${titleSample}` : ''}
      ${pricemin ? `and Product.price >= ${pricemin}` : ''}
      ${pricemax ? `and Product.price <= ${pricemax}` : ''}
    group by Product.id
    order by ${sortSQL} limit $<limit> offset $<offset>;
  `;
};

const GET_ITEM = `
  select
    Product.id,
    Product.title,
    Product.price,
    Product.discountPrice,
    Product.link,
    Product.imgUrl,
    Product.category,
    Product.composition,
    Product.description,
    Product.createdAt,
    avg(Rate.value) AS rate,
    count(Rate.*) AS votesCount,
    count(Review.*) AS reviewsCount,
    array(
      select productGroup
      from ProductGroup
      where productId = Product.id
    ) AS productGroups,
    ( 
      select json_agg(T)
      from (
        select 
          Review.id,
          Review.text,
          Review.postedAt,
          Review.changedAt,
          Account.email
        from Review
          inner join Account on Review.accountId = Account.id
        where Review.productId = Product.id
        group by Review.id, Account.email
      ) as T
    ) as reviewsList
  from Product
    left join Rate on Product.id = Rate.productId
    left join Review on Product.id = Review.productId
  where status = 'default' and Product.link = $1
  group by Product.id;
`;

const GET_GROUPS = `
  select distinct productGroup
  from ProductGroup;
`;

const GET_CATEGORIES = `
  select distinct category
  from Product;
`;

module.exports = {
  GET_LIST,
  GET_ITEM,
  GET_GROUPS,
  GET_CATEGORIES,
};

