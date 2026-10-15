// Minimal static server for previewing newtab.html
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const types = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json',
  '.txt': 'text/plain',
};

http.createServer((req, res) => {
  const url = req.url === '/' ? '/newtab.html' : req.url.split('?')[0];
  const file = path.join(root, decodeURIComponent(url));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(4173, () => console.log('serving on http://localhost:4173'));
