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
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');



app.get('/signup', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates', 'signup.html'));
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates', 'username.html'));
});

app.get('/home', function(req, res) {
  const { budget } = req.query;
  if (!budget) {
    res.redirect('/');
    return;
  }
  res.render('/home', {budget, username});
});




app.post('/submit-signup', function(req, res){
  const {username, password, budget} = req.body;

  const dbadd = 'INSERT INTO userinfo (username, userpassword, userbudget) VALUES (?, ?, ?)';
  pool.execute(dbadd, [username, password, budget], function(err, result) {
    if(err) {
      console.error('Error inserting: ', err)
      return result.end('Error');
    }
    res.redirect('/home');
  });
});



app.post('/submit-login', function(req, res){
  const {username, password} = req.body;
  const verify = 'SELECT * FROM userinfo WHERE username = ? and userpassword = ?';
  
  pool.execute(verify, [username, password], function(err, result){
    if(err) {
      console.error("Error logging in", err);
      return;
    }
    if(result.length > 0) {
      const user = result[0];
      res.render('home', { budget:user.userbudget, username: user.username});
    }
    else {
      res.end('Invalid username or password');
    }

  });
});



app.post('/submit-budget', function(req, res) {
  const {budget} = req.body;
  const username = req.body.username;
  
  const update = 'UPDATE userinfo SET userbudget = ? WHERE username = ?';
  pool.execute(update, [budget, username], function(err, result) {
   
    res.render('home', { budget, username} );
  });
});


app.listen(port,  () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
