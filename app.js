const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(`${__dirname}/`));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './src/index.html'));
});
app.get('/toggle', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'src/toggle.html'));
});
app.get('/portfolio', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'src/portfolio.html'));
});
app.listen(process.env.PORT || 5000);
console.log('[ ! ] listening on port 8080');
