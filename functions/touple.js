module.exports = (str) => {
  const body = JSON.parse(str).map((item) => `\'${item}\'`).join(', ');
  return `(${body})`;
}