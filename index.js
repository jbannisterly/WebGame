const { createServer } = require('node:http');
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile('game.html', { root: __dirname + '/Frontend'});
});

app.use(express.static(path.join(__dirname, 'Frontend/out')));
app.use(express.static(path.join(__dirname, 'Frontend/')));

app.listen(port, () => {
  console.log("App listening...");
});