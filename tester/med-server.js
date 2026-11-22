// Kjører en test med en innebygd lokal server på port 8123 (repo-roten), så du ikke må starte en server først.
// Serveren lever bare så lenge testen kjører.
// Bruk (fra repo-roten):  node tester/med-server.js tester/visuell-0.3.js [argumenter til testen]
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.md': 'text/plain; charset=utf-8',
};

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
srv.listen(8123, () => {
  srv.unref(); // prosessen avsluttes når testen er ferdig
  const test = process.argv[2];
  if (!test) { console.log('Bruk: node tester/med-server.js <testfil> [argumenter]'); process.exit(1); }
  process.argv.splice(1, 1); // testen ser sine egne argumenter som før (process.argv[2] …)
  require(path.resolve(test));
});
