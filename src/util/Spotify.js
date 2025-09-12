// Spotify utility (Authorization Code with PKCE)
// Summary:
// - Starts PKCE auth by generating a code_verifier and code_challenge, then redirects to Spotify authorize.
// - On redirect back with a code, exchanges code+verifier via our local backend (/api/token) for an access token.
// - Caches token with expiry and exposes search() and savePlaylist() helpers.
// Endpoints used:
// - GET https://accounts.spotify.com/authorize (front-end redirect)
// - POST http://127.0.0.1:5000/api/token (local exchange → Spotify /api/token)
// - GET https://api.spotify.com/v1/search?type=track&q={term}
// - GET https://api.spotify.com/v1/me
// - POST https://api.spotify.com/v1/users/{userId}/playlists
// - POST https://api.spotify.com/v1/users/{userId}/playlists/{playlistId}/tracks
// Variable to hold the access token
let accessToken;
let tokenExpirationTime = 0; // epoch ms when token expires

// OAuth configuration
const clientId = '9ddc113def3f479aabc0a06fe739947d'; // Spotify App Client ID
// Authorization Code with PKCE configuration
const redirectUri = 'http://127.0.0.1:3000/';
const authEndpoint = 'https://accounts.spotify.com/authorize';
const scopes = ['playlist-modify-public'];
let codeVerifier; // stored in-memory; also persisted to localStorage

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await window.crypto.subtle.digest('SHA-256', data);
}

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createCodeChallenge(v) {
  const hashed = await sha256(v);
  return base64url(hashed);
}

// Spotify module object
const Spotify = {
  async getAccessToken() {
    // Cached and valid
    if (accessToken && Date.now() < tokenExpirationTime) return accessToken;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (error) {
      console.error('Spotify auth error:', error);
      // Clear query to avoid loops
      window.history.replaceState({}, document.title, '/');
    }
    if (code) {
      // Exchange code for token
      const storedVerifier = localStorage.getItem('spotify_code_verifier');
      if (!storedVerifier) {
        console.error('Missing code_verifier');
        return;
      }
      const resp = await fetch('http://127.0.0.1:5000/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, code_verifier: storedVerifier })
      });
      const json = await resp.json();
      if (!resp.ok) {
        console.error('Token exchange failed', json);
        // If code_verifier mismatch or code invalid/used, restart PKCE flow cleanly
        if (json && (json.error === 'invalid_grant' || json.error === 'invalid_request')) {
          localStorage.removeItem('spotify_code_verifier');
          // remove code from URL to avoid reuse
          window.history.replaceState({}, document.title, '/');
          // restart auth
          return await this._beginPkceAuth();
        }
        return;
      }
      accessToken = json.access_token;
      const expiresIn = json.expires_in || 3600;
      tokenExpirationTime = Date.now() + expiresIn * 1000;
      window.history.replaceState({}, document.title, '/');
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      return accessToken;
    }

    // Begin PKCE auth
    return await this._beginPkceAuth();
  },

  async _beginPkceAuth() {
    codeVerifier = generateRandomString(128);
    localStorage.setItem('spotify_code_verifier', codeVerifier);
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = generateRandomString(16);
    const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&code_challenge_method=S256&code_challenge=${codeChallenge}&state=${state}`;
    window.location = authUrl;
  }
  ,
  // Search for tracks matching the provided term
  async search(term) {
    if (!term) return [];
    const accessToken = await this.getAccessToken();
    if (!accessToken) return [];
    const endpoint = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`;
    try {
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error(`Spotify search failed: ${res.status}`);
      const json = await res.json();
      if (!json.tracks || !json.tracks.items) return [];
      return json.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  // Save a playlist (now includes user ID fetch + playlist creation).
  async savePlaylist(name, trackUris) {
  // Validate inputs and abort when required data is missing
    if (!name || !trackUris || trackUris.length === 0) return;

    // Setup variables
    const accessToken = await this.getAccessToken();
    if (!accessToken) return;
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;
    let playlistID;

    // Get current user id
    try {
      let res = await fetch('https://api.spotify.com/v1/me', { headers });
      if (!res.ok) throw new Error('Failed to get user id');
      let json = await res.json();
      userId = json.id;

      // Create new playlist for the user
      res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed to create playlist');
      json = await res.json();
      playlistID = json.id;

      // Add tracks to playlist
      res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: trackUris })
      });
      if (!res.ok) throw new Error('Failed to add tracks to playlist');
      return await res.json();
    } catch (err) {
      console.error('savePlaylist error:', err);
    }
  }
};

export default Spotify;
