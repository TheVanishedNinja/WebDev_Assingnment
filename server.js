const { createServer } = require('node:http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;



const server = createServer((req, res) => {

  let filePath = '';
  if (req.url === '/' || req.url === '/login.html') {
    filePath = path.join(__dirname, 'templates', 'login.html');
  } else if (req.url.endsWith('.html')) {
    filePath = path.join(__dirname, 'templates', req.url);
  } else if (req.url.endsWith('.css')) {
    filePath = path.join(__dirname, 'public', req.url);
  } else {
    res.statusCode = 404;
    res.end('Error: Resource Not Found');
    console.log(`Resource not found: ${req.url}`);
    return;
  }

  const ext = path.extname(filePath);
  const contentType = ext === '.css' ? 'text/css' : 'text/html';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      console.error(`Error reading file: ${filePath}`, error);
      res.statusCode = 404;
      res.end('Error: File Not Found');
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(data);
    }
  });
});

const mysql = require('mysql2');
const express = require('express');
const app = express();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "BunnyWheat!234",
  database: "budgetdb",
})

app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates', 'signup.html'));
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

app.post('/submit-login', function(req, res){
  const {username, password} = req.body;

  const dbadd = 'INSERT INTO userinfo (username, userpassword) VALUES (?, ?)'
  pool.execute(dbadd, [username, password], function(err, result) {
    if(err) {
      console.error('Error inserting: ', err)
      return;
    }
    res.status(200)
    res.end('Successful signup');
  });
});

app.listen(port,  () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
