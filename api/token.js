// Vercel Serverless Function: Spotify PKCE token exchange
// POST /api/token with JSON { code, code_verifier }
// Env vars required (configure in Vercel):
// - SPOTIFY_CLIENT_ID
// - SPOTIFY_REDIRECT_URI (e.g., https://jammmingswithme.surge.sh/)
// Optional:
// - CORS_ORIGIN (defaults to *)

module.exports = async function handler(req, res) {
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const { code, code_verifier } = req.body || {};
    if (!code || !code_verifier) {
      return res.status(400).json({ error: 'missing_parameters' });
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      code_verifier
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const json = await tokenRes.json();
    return res.status(tokenRes.status).json(json);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
}
