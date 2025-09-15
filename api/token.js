// Vercel Serverless Function: Spotify PKCE token exchange
// POST /api/token with JSON { code, code_verifier }
// Env vars required (configure in Vercel):
// - SPOTIFY_CLIENT_ID
// - SPOTIFY_REDIRECT_URI (e.g., https://jammmingswithme.surge.sh/)
// Optional:
// - CORS_ORIGIN (defaults to *)

const https = require('https');
const { URL } = require('url');

function setCors(res, allowedOrigin) {
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Diagnostics headers
  res.setHeader('X-CORS-Origin-Echo', allowedOrigin);
}

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function postForm(targetUrl, formBody) {
  const url = new URL(targetUrl);
  const bodyStr = new URLSearchParams(formBody).toString();
  const options = {
    method: 'POST',
    hostname: url.hostname,
    path: url.pathname + (url.search || ''),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(bodyStr)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (resp) => {
      let data = '';
      resp.on('data', (chunk) => { data += chunk; });
      resp.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data || '{}'); } catch { parsed = {}; }
        resolve({ statusCode: resp.statusCode || 500, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  const allowed = process.env.CORS_ORIGIN || '*';
  setCors(res, allowed);
  
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  
  // Simple health/info for GET
  if (req.method === 'GET') {
    const envOk = Boolean(process.env.SPOTIFY_CLIENT_ID) && Boolean(process.env.SPOTIFY_REDIRECT_URI);
    return json(res, 200, { ok: true, message: 'Use POST with JSON { code, code_verifier }', envOk });
  }
  
  // Only POST is supported for token exchange
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method_not_allowed' });
  }
  
  try {
    const payload = await parseJsonBody(req);
    const { code, code_verifier } = payload || {};
    
    if (!code || !code_verifier) {
      return json(res, 400, { error: 'missing_parameters' });
    }
    
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI) {
      return json(res, 500, { error: 'missing_env', clientId: Boolean(process.env.SPOTIFY_CLIENT_ID), redirect: Boolean(process.env.SPOTIFY_REDIRECT_URI) });
    }
    
    const form = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      code_verifier
    };
    
    const result = await postForm('https://accounts.spotify.com/api/token', form);
    return json(res, result.statusCode, result.body);
  } catch (e) {
    console.error('Token function error:', e);
    return json(res, 500, { error: 'server_error' });
  }
}