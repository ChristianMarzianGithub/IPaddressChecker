import { createServer } from 'http';
import { URL } from 'url';
import net from 'net';
import { lookupIpMetadata, getClientIp } from './services/ipService.js';

const PORT = process.env.PORT || 8080;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',');

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/ip') {
    const ip = getClientIp(req);
    sendJson(res, 200, { ip });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/lookup') {
    const ip = url.searchParams.get('ip');
    if (!ip || !net.isIP(ip)) {
      sendJson(res, 400, { message: 'Invalid or missing ip parameter' });
      return;
    }
    try {
      const data = await lookupIpMetadata(ip);
      sendJson(res, 200, data);
    } catch (error) {
      const status = error.statusCode || 500;
      sendJson(res, status, { message: error.message || 'Lookup failed' });
    }
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
}

export function startServer(port = PORT) {
  const server = createServer((req, res) => {
    handler(req, res);
  });
  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startServer().then(() => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}
