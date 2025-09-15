## Jammming — Spotify Playlist Builder

Search Spotify, curate tracks, and save playlists to your account. Built with React, using Authorization Code with PKCE for secure login, and a tiny serverless function to exchange tokens.

- Live demo: https://jammmingswithme.surge.sh/
- Token endpoint (Vercel): https://jammming-alpha.vercel.app/api/token

### Features
- Search tracks by name/artist/album
- Add/remove tracks to a staging playlist
- Name your playlist and save to your Spotify account
- PKCE-based login (no client secret in the browser)

### Tech Stack
- React (Create React App)
- Spotify Web API — Authorization Code with PKCE
- Serverless token exchange (Vercel Function)
- Surge for static hosting

## Screenshots
Add two screenshots in the repo (or swap these with your own paths):
- public/og-image.png — social preview
- Screenshot of the app UI

## Local Setup
1) Clone and install

```powershell
git clone <your-repo-url>
cd jammming
npm install
```

2) Create a Spotify App at https://developer.spotify.com/dashboard
- Add a Redirect URI: http://127.0.0.1:3000/

3) Configure env

```powershell
copy .env.example .env
# Edit .env and set REACT_APP_TOKEN_ENDPOINT to your dev token server (e.g., http://127.0.0.1:5000/api/token)
```

4) Start dev servers (Express token server + React app)

```powershell
npm run dev
```

Open http://127.0.0.1:3000 and search to trigger login.

## Environment Variables

Frontend (.env):
- REACT_APP_TOKEN_ENDPOINT: URL to your token exchange endpoint

Serverless (Vercel Project settings → Environment Variables):
- SPOTIFY_CLIENT_ID: Your Spotify App Client ID (not a secret)
- SPOTIFY_REDIRECT_URI: Exact URL including trailing slash (e.g., https://your-surge-domain.surge.sh/)
- CORS_ORIGIN: Your frontend origin (e.g., https://your-surge-domain.surge.sh)

## Deploy

Static frontend (Surge):

```powershell
npm run build
npx surge ./build your-domain.surge.sh
```

Serverless token (Vercel):
1) Add env vars in Vercel: SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, CORS_ORIGIN
2) Deploy. If using a Production domain, disable Deployment Protection for preflight to pass.
3) Verify health at GET /api/token (returns { ok: true, envOk: true })

## Security Notes
- PKCE uses only the client ID in the browser; do not commit client secrets.
- Do not commit your .env; use .env.example for placeholders.

## License
MIT — see LICENSE

