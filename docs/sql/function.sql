--------------------------------------------------------------------------------
-- add new account -------------------------------------------------------------
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION account_add_func(
  arg_email CHARACTER VARYING,
  arg_password CHARACTER VARYING
)
  RETURNS INTEGER
  LANGUAGE plpgsql
AS $$
  DECLARE
    is_exists BOOLEAN;
  BEGIN
    is_exists = (
      SELECT COUNT(1) > 0 
      FROM Account
      WHERE email = arg_email
    );

    IF (is_exists) THEN
      RAISE 'User with this email exists!';
    END IF;

    INSERT INTO Account (email, password)
    VALUES (arg_email, arg_password);
    RETURN currval('account_id_seq');
  END;
$$;


--------------------------------------------------------------------------------
-- rate product ----------------------------------------------------------------
--------------------------------------------------------------------------------
create or replace function product_rate_func(
  arg_account_id integer,
  arg_product_link character varying,
  arg_value integer
)
  returns void
  language plpgsql
as $$
  declare
    selectedProductId integer;
    isExists boolean;
  begin 
    selectedProductId = (select id from Product where link = arg_product_link);

    isExists = (
      select count(1) > 0 
      from Rate 
      where accountId = arg_account_id and productId = selectedProductId
    );

    if (isExists) then
      update Rate
      set value = arg_value
      where accountId = arg_account_id and productId = selectedProductId;
    else 
      insert into Rate (productId, accountId, value)
      values(selectedProductId, arg_account_id, arg_value);
    end if;
  end;
$$;

--------------------------------------------------------------------------------
-- add review ------------------------------------------------------------------
--------------------------------------------------------------------------------
create or replace function review_add_func(
  arg_product_link character varying,
  arg_account_id integer,
  arg_text text
)
  returns void
  language plpgsql
as $$
  declare 
    selectedProductId integer;
    isExists boolean;
  begin
    selectedProductId = (select id from Product where link = arg_product_link);
    
    isExists = (
      select count(1) > 0
      from Review
      where productId = selectedProductId and accountId = arg_account_id
    );

    if (isExists) then
      update Review
      set text = arg_text
      where accountId = arg_account_id and productId = selectedProductId;
    else
      insert into Review (productId, accountId, text)
      values(selectedProductId, arg_account_id, arg_text);
    end if;
  end;
$$;

--------------------------------------------------------------------------------
-- order add -------------------------------------------------------------------
--------------------------------------------------------------------------------
-- '[{"productid": "1", "quantity": "10"}]'::json 
create or replace function order_add_func(
  arg_order_id character varying,
  arg_account_id integer,
  arg_product_list json,
  arg_address character varying,
  arg_phone character varying
)
  returns void
  language plpgsql
as $$
  declare 
    total numeric(10, 2);
    orderId integer;
  begin 
    create temp table tempCart as (
      select *
      from json_to_recordset(arg_product_list) 
        as x(productid integer, quantity integer)
    );

    total = (
      select sum(sum_product) as sumTotal
      from (
        select sum(quantity * Product.price) as sum_product
        from tempCart
          inner join Product on productid = Product.id
        group by Product.id
      ) as listProductSum
    );

    insert into CustomerOrder (id, accountId, totalPrice, address, phone)
    values (arg_order_id, arg_account_id, total, arg_address, arg_phone);

    insert into OrderList
    select arg_order_id as orderId, * from tempCart;

    drop table tempCart;
  end;
$$;