--------------------------------------------------------------------------------
-- Account ---------------------------------------------------------------------
--------------------------------------------------------------------------------
create table Account (
  id serial not null,
  email character varying not null,
  password character varying not null,
  registeredAt timestamp with time zone not null default now(),
  constraint pkAccount_id primary key (id)
);

--------------------------------------------------------------------------------
-- AdminPanel ------------------------------------------------------------------
--------------------------------------------------------------------------------
create table AdminPanel (
  id serial not null,
  login character varying not null,
  password character varying not null,
  constraint pkAdminPanel_id primary key (id)
);

--------------------------------------------------------------------------------
-- Product ---------------------------------------------------------------------
--------------------------------------------------------------------------------
create table Product (
  id serial not null,
  title character varying not null,
  price numeric(10, 2) not null,
  discountPrice numeric(10, 2) not null,
  link character varying not null,
  status character varying not null,
  imgURL character varying not null,
  category character varying not null,
  composition character varying not null,
  description text not null,
  createdAt timestamp with time zone not null default now(),
  constraint pkProduct_id primary key (id)
);

--------------------------------------------------------------------------------
-- Rate ------------------------------------------------------------------------
--------------------------------------------------------------------------------
create table Rate (
  productId integer not null,
  accountId integer not null,
  value smallint not null,
  constraint pkRate_productId_accountId primary key (productId, accountId),
  constraint fkRate_productId foreign key (productId)
    references Product(id) on delete cascade on update cascade,
  constraint fkRate_accountId foreign key (accountId)
    references Account(id) on delete cascade on update cascade
);

--------------------------------------------------------------------------------
-- Review ----------------------------------------------------------------------
--------------------------------------------------------------------------------
create table Review (
  id serial not null,
  productId integer not null,
  accountId integer not null,
  text text not null,
  postedAt timestamp with time zone not null default now(),
  changedAt timestamp with time zone null,
  constraint pkReview_id primary key (id),
  constraint fkReview_productId foreign key (productId)
    references Product(id) on delete cascade on update cascade,
  constraint fkReview_accountId foreign key (accountId)
    references Account(Id) on delete cascade on update cascade
);

create or replace function fn_Review_update_changedAt()
  returns trigger
  language plpgsql
as $$
begin
  new.changedAt = now();
  return new;
end;$$;

create trigger tg_Review_update_changedAt before update on Review
  for each row execute procedure fn_Review_update_changedAt();

--------------------------------------------------------------------------------
-- ProductGroup ----------------------------------------------------------------
--------------------------------------------------------------------------------
create table ProductGroup (
  productId integer not null,
  productGroup character varying not null,
  constraint pkProductGroup_productId_productGroup primary key (productId, productGroup),
  constraint fkProductGroup_productId foreign key (productId)
    references Product(id) on delete cascade on update cascade
);

--------------------------------------------------------------------------------
-- CustomerOrder ---------------------------------------------------------------
--------------------------------------------------------------------------------
create table CustomerOrder (
  id character varying not null,
  accountId integer not null,
  address character varying not null,
  phone character varying not null,
  status character varying not null,
  totalPrice numeric(10, 2) not null,
  postedAt timestamp with time zone not null default now(),
  completedAt timestamp with time zone null,
  constraint pkCustomerOrder_id primary key (id),
  constraint fkCustomerOrder_accountId foreign key (accountId)
    references Account(id) on delete cascade on update cascade
);

--------------------------------------------------------------------------------
-- OrderList -------------------------------------------------------------------
--------------------------------------------------------------------------------
create table OrderList (
  orderId character varying not null,
  productId integer not null,
  quantity integer not null,
  constraint pkOrderList_orderId_productId primary key (orderId, productId),
  constraint fkOrderList_orderId foreign key (orderId)
    references CustomerOrder(id) on delete cascade on update cascade,
  constraint fkOrderList_productId foreign key (productId)
    references Product(id) on delete set null on update cascade
);
