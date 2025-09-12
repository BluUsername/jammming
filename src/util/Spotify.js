// Spotify utility module
// Variable to hold the access token
let accessToken;
let tokenExpirationTime = 0; // epoch ms when token expires

// OAuth configuration
const clientId = '9ddc113def3f479aabc0a06fe739947d'; // Spotify App Client ID
// Fixed Redirect URI (Option B) using 127.0.0.1; ensure this exact value (with trailing slash) is registered.
const redirectUri = 'http://127.0.0.1:3000/';
const authEndpoint = 'https://accounts.spotify.com/authorize';
const scopes = ['playlist-modify-public'];

// Spotify module object
const Spotify = {
  getAccessToken() {
    // If token exists and not expired, return it
    if (accessToken && Date.now() < tokenExpirationTime) {
      return accessToken;
    }

    // Check URL for access token fragment
    const url = window.location.href;
    const accessTokenMatch = url.match(/access_token=([^&]*)/);
    const expiresInMatch = url.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      tokenExpirationTime = Date.now() + expiresIn * 1000;

  // Schedule token invalidation when it expires
      window.setTimeout(() => accessToken = '', expiresIn * 1000);

  // Remove token fragment parameters from the URL
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    }

  // No token cached and not present in URL -> start implicit grant redirect
  const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=token&scope=${encodeURIComponent(scopes.join(' '))}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location = authUrl;
  }
  ,
  // Search for tracks matching the provided term
  search(term) {
    if (!term) return Promise.resolve([]);
    const accessToken = this.getAccessToken();
    const endpoint = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`;
    return fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Spotify search failed: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!json.tracks || !json.tracks.items) return [];
        return json.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }));
      })
      .catch(err => {
        console.error(err);
        return [];
      });
  },
  // Save a playlist (now includes user ID fetch + playlist creation).
  savePlaylist(name, trackUris) {
    // Step 90: validate inputs
    if (!name || !trackUris || trackUris.length === 0) return Promise.resolve();

    // Setup variables
    const accessToken = this.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userId;
    let playlistID;

    // Get current user id
    return fetch('https://api.spotify.com/v1/me', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to get user id');
        return res.json();
      })
      .then(json => {
        userId = json.id;
        // Create new playlist for the user
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create playlist');
        return res.json();
      })
      .then(json => {
        playlistID = json.id; // store playlist ID for next step (adding tracks)
        // Add tracks to playlist
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ uris: trackUris })
        });
      })
      .then(res => {
        if (!res) return; // safety
        if (!res.ok) throw new Error('Failed to add tracks to playlist');
        return res.json();
      })
      .catch(err => {
        console.error('savePlaylist error:', err);
      });
  }
};

export default Spotify;
