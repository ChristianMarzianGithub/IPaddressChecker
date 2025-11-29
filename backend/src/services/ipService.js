import { networkInterfaces } from 'os';
import { promises as dns } from 'dns';
import https from 'https';
import net from 'net';

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const parts = Array.isArray(forwarded) ? forwarded : forwarded.split(',');
    const ip = parts.map((p) => p.trim()).find((entry) => net.isIP(entry));
    if (ip) return ip;
  }
  const remote = req.socket?.remoteAddress;
  if (remote) {
    if (remote.startsWith('::ffff:')) {
      return remote.replace('::ffff:', '');
    }
    return remote;
  }
  const fallback = Object.values(networkInterfaces())
    .flat()
    .find((iface) => iface && iface.family === 'IPv4' && !iface.internal);
  return fallback?.address || '0.0.0.0';
}

export async function reverseLookup(ip) {
  try {
    const results = await dns.reverse(ip);
    return results[0] || null;
  } catch (error) {
    return null;
  }
}

function fetchFromIpApi(ip) {
  const endpoint = `https://ipapi.co/${encodeURIComponent(ip)}/json/`;
  return new Promise((resolve, reject) => {
    const req = https.get(endpoint, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
  });
}

export async function lookupIpMetadata(ip) {
  const version = net.isIP(ip);
  if (!version) {
    const err = new Error('Invalid IP address');
    err.statusCode = 400;
    throw err;
  }

  const [reverse, info] = await Promise.all([
    reverseLookup(ip),
    fetchFromIpApi(ip).catch(() => null),
  ]);

  const geo = info
    ? {
        country: info.country_name || info.country || null,
        region: info.region || info.region_code || null,
        city: info.city || null,
      }
    : { country: null, region: null, city: null };

  const privacy = info?.privacy || {};

  return {
    ip,
    version,
    reverse,
    geo,
    asn: info?.asn || info?.asn_org || null,
    isp: info?.org || info?.org_name || info?.asn_org || null,
    flags: {
      datacenter: Boolean(privacy.is_datacenter),
      proxy: Boolean(privacy.is_proxy),
      vpn: Boolean(privacy.is_vpn),
      tor: Boolean(privacy.is_tor),
    },
  };
}
