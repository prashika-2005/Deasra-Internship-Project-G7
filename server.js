const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT || 3000, 10);
const HOST = '0.0.0.0';
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Remove query parameters from URL
  const reqUrl = req.url.split('?')[0];
  let filePath = path.join(PUBLIC_DIR, reqUrl === '/' ? 'index.html' : reqUrl);
  filePath = path.normalize(filePath);

  // Security check to ensure requested path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`500 Internal Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

let isBrowserOpened = false;

function openBrowser(url) {
  if (isBrowserOpened) return;
  isBrowserOpened = true;
  const startCmd = process.platform === 'win32' ? `start ${url}` :
                   process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(startCmd, (err) => {
    if (err) console.log(`Open your browser manually at ${url}`);
  });
}

function listen(port) {
  server.listen(port, () => {
    const urlLocal = `http://127.0.0.1:${port}/`;
    const urlNamed = `http://localhost:${port}/`;
    console.log(`\n==================================================`);
    console.log(`🚀 Escape Room Server running successfully!`);
    console.log(`👉 Access URL (localhost): ${urlNamed}`);
    console.log(`👉 Access URL (127.0.0.1): ${urlLocal}`);
    console.log(`==================================================\n`);
    
    if (process.argv.includes('--open') || process.env.AUTO_OPEN !== 'false') {
      openBrowser(urlNamed);
    }
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[INFO] Port ${PORT} is in use, trying port ${PORT + 1}...`);
    PORT++;
    listen(PORT);
  } else {
    console.error('Server error:', err);
  }
});

listen(PORT);
