import test from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';
import https from 'node:https';
import dns from 'node:dns/promises';
import { startServer } from '../src/server.js';

test('GET /ip returns forwarded address when provided', async () => {
  const server = await startServer(0);
  const { port } = server.address();
  const response = await fetch(`http://localhost:${port}/ip`, {
    headers: { 'x-forwarded-for': '203.0.113.10' },
  });
  const data = await response.json();
  assert.equal(data.ip, '203.0.113.10');
  server.close();
});

test('GET /lookup validates ip and returns metadata', async () => {
  const server = await startServer(0);
  const { port } = server.address();

  const httpsMock = mock.method(https, 'get', (url, cb) => {
    cb({
      on: (event, handler) => {
        if (event === 'data') handler(JSON.stringify({
          country_name: 'Testland',
          region: 'TL',
          city: 'Example City',
          asn: 'AS123',
          org: 'Example ISP',
          privacy: { is_vpn: true },
        }));
        if (event === 'end') handler();
      },
    });
    return { on: () => {}, end: () => {}, destroy: () => {} };
  });

  const dnsMock = mock.method(dns, 'reverse', async () => ['example.test']);

  const response = await fetch(`http://localhost:${port}/lookup?ip=203.0.113.5`);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.reverse, 'example.test');
  assert.equal(data.geo.country, 'Testland');
  assert.equal(data.asn, 'AS123');
  assert.equal(data.flags.vpn, true);

  httpsMock.mock.restore();
  dnsMock.mock.restore();
  server.close();
});

test('GET /lookup rejects invalid ip', async () => {
  const server = await startServer(0);
  const { port } = server.address();

  const response = await fetch(`http://localhost:${port}/lookup?ip=not-an-ip`);
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.ok(data.message.includes('Invalid'));

  server.close();
});
