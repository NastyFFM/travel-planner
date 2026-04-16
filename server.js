const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3100;
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};
const APP_NAME = path.basename(__dirname);

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url.startsWith('/app/' + APP_NAME + '/api/')) {
    const file = url.split('/api/')[1].replace(/[^a-z0-9-]/gi, '');
    if (!file) { res.writeHead(400); return res.end('bad request'); }
    const fp = path.join(__dirname, 'data', file + '.json');
    if (req.method === 'GET') {
      try { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(fs.readFileSync(fp)); }
      catch { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); }
      return;
    }
    if (req.method === 'PUT') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        try {
          fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
          fs.writeFileSync(fp, body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        } catch (e) {
          res.writeHead(500);
          res.end('{"ok":false}');
        }
      });
      return;
    }
    res.writeHead(405); return res.end('method not allowed');
  }

  const safe = url === '/' ? 'index.html' : url.replace(/\.\./g, '');
  const fp = path.join(__dirname, safe);
  try {
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'text/plain' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(PORT, () => console.log('travel-planner listening on ' + PORT));
