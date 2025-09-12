// Minimal PKCE token exchange server for Spotify Authorization Code with PKCE
// NOTE: For real deployment secure client secret handling and HTTPS.
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '9ddc113def3f479aabc0a06fe739947d';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || ''; // optional if using plain Authorization Code (not pure PKCE)
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3000/';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Exchange authorization code for tokens
app.post('/api/token', async (req, res) => {
  try {
    const { code, code_verifier } = req.body;
    if (!code || !code_verifier) {
      return res.status(400).json({ error: 'missing_parameters' });
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier
    });

    // If using confidential app with client secret available locally you can include it:
    if (CLIENT_SECRET) body.append('client_secret', CLIENT_SECRET);

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const json = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(tokenRes.status).json(json);
    }
    res.json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server_error' });
  }
});

app.listen(PORT, () => console.log(`PKCE token server running on port ${PORT}`));
