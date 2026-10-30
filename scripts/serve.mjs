import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const securityHeaders = {
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
};
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) throw new Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const ext = extname(file);
    const charset = ['.html','.js','.css','.json','.svg'].includes(ext) ? '; charset=utf-8' : '';
    const downloadHeaders = ext === '.docx' ? { 'Content-Disposition':'attachment' } : {};
    res.writeHead(200, { ...securityHeaders, ...downloadHeaders, 'Content-Type': `${mime[ext] || 'application/octet-stream'}${charset}`, 'Cache-Control':'no-store' });
    res.end(await readFile(file));
  } catch { res.writeHead(404, { 'Content-Type':'text/plain' }); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Culture is ready at http://localhost:${port}`));
