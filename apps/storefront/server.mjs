import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const products = [
  { id: 'starter', name: 'Automation Starter', price: 49 },
  { id: 'rescue', name: 'Flaky Test Rescue', price: 89 },
];

createServer(async (request, response) => {
  if (request.url === '/api/health') return json(response, 200, { status: 'ok' });
  if (request.url === '/api/products') return json(response, 200, { products });
  if (request.url === '/api/orders' && request.method === 'POST') {
    let body = '';
    for await (const chunk of request) body += chunk;
    const order = JSON.parse(body);
    return json(response, 201, { id: 'ORDER-1001', status: 'confirmed', total: order.total });
  }
  if (request.url === '/' || request.url === '/index.html') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return response.end(await readFile(path.join(root, 'index.html')));
  }
  if (request.url === '/app.js') {
    response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    return response.end(await readFile(path.join(root, 'app.js')));
  }
  response.writeHead(404).end('Not found');
}).listen(4173, '127.0.0.1');

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}
