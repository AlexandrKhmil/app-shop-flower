const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.use(express.json({ extended: true }));
app.use('/api/accounts', require('./routes/accounts.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
// app.use('/api/admin', require('./routes/admin.routes'));

// app.use('/', express.static(path.join(__dirname, 'client', 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
// });

app.listen(port, () => {
  console.log(`App listening at ${port}`);
});