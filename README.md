## Jammming

Jammming is a web app for building Spotify playlists. It offers fast track search, a focused staging area for curation, and one‑click saving to the user’s Spotify account. The authentication flow uses OAuth 2.0 Authorization Code with PKCE to keep credentials out of the browser and avoid storing client secrets in the frontend.

Live site: https://jammmingswithme.surge.sh/

### What it does
- Searches the Spotify catalog by track, artist, or album
- Lets users assemble and refine a temporary track list
- Saves the list to Spotify as a new playlist under the user’s account

### Architecture at a glance
- Client: React single‑page application responsible for search, playlist state, and user interactions
- Auth: Authorization Code with PKCE; the browser generates a code challenge and completes sign‑in with Spotify
- Token exchange: A minimal serverless endpoint on Vercel handles the authorization code exchange and CORS, returning short‑lived access tokens to the client
- Hosting: Static frontend on Surge; token API on Vercel Functions

This separation keeps the client secret off the client entirely while preserving a lightweight footprint—no full backend is required.

### Technology
- React (Create React App)
- Spotify Web API
- OAuth 2.0 Authorization Code with PKCE
- Vercel Functions (token exchange)
- Surge (static hosting)

### Security and privacy
- PKCE is used exclusively; no client secrets are embedded in the browser
- Scopes are limited to playlist creation and modification
- Responses from the token endpoint are short‑lived and marked non‑cacheable

### Preview
- A social preview image is included at `public/og-image.png`
- Additional UI screenshots may be added to showcase the search and playlist screens

### License
MIT — see LICENSE

