const SELECT_USER_BY_EMAIL = `
  select id, password
  from Account
  where email = $1;
`;

const SELECT_EMAIL_BY_ID = `
  select email
  from Account
  where id = $1;
`;

const SELECT_PASSWORD = `
  select password
  from Account
  where id = $1;
`;

const UPDATE_PASSWORD = `
  update Account
  set password = $1
  where id = $2;
`;

module.exports = {
  SELECT_USER_BY_EMAIL,
  SELECT_EMAIL_BY_ID,
  SELECT_PASSWORD,
  UPDATE_PASSWORD,
};