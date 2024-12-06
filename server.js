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

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
