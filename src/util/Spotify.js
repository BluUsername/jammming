// Spotify utility module
// Variable to hold the access token
let accessToken;
let tokenExpirationTime = 0; // epoch ms when token expires

// Configuration (replace clientId with your own Spotify app client ID)
const clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // TODO: replace with your registered Spotify App Client ID
// Per step 81: registered redirect URI must match exactly what is set in the Spotify dashboard
// Ensure you've added: http://127.0.0.1:3000/ as an allowed Redirect URI
const redirectUri = 'http://127.0.0.1:3000/';
const authEndpoint = 'https://accounts.spotify.com/authorize';
const scopes = ['playlist-modify-public','playlist-modify-private'];

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

      // Schedule token invalidation per step 80
      window.setTimeout(() => accessToken = '', expiresIn * 1000);

      // Clear the parameters from the URL (do not contain token anymore)
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    }

  // Third condition (step 81): no token cached and not present in URL -> redirect for implicit grant
    const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(clientId)}&response_type=token&scope=${encodeURIComponent(scopes.join(' '))}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location = authUrl;
  }
};

export default Spotify;
