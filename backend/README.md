# Backend README (canonical)

This is the single canonical deployment & configuration guide for the backend. Other `DEPLOYMENT_*` or `README_*` files are deprecated — please refer to this file.

## Production environment variables (required)
- NODE_ENV=production
- PORT=5001
- FRONTEND_URL=https://www.nbaurum.com
- CORS_ORIGIN=https://www.nbaurum.com
- MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
- JWT_SECRET (strong secret)
- GOOGLE_CLIENT_ID (from Google Cloud Console)
- GOOGLE_CLIENT_SECRET (from Google Cloud Console)

Set these variables in your host environment (PM2/systemd/Docker) or your platform (Vercel environment variables). Do NOT rely on a local `.env` file in production unless your deployment reads it.

## Google Cloud Console — Exact entries (CRITICAL)
In the OAuth 2.0 Client (Credentials → OAuth 2.0 Client IDs):
- Authorized JavaScript origins (exact):
  - `https://www.nbaurum.com`
- Authorized redirect URIs (exact):
  - `https://api.nbaurum.com/auth/google/callback`

Remove all other origins and redirect URIs (localhost, `*.vercel.app`, `http://api.nbaurum.com`, frontend callback URIs). Save changes and wait a few minutes for propagation.

## Vercel (frontend) environment variables
- VITE_API_BASE_URL=https://api.nbaurum.com
- VITE_GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>

After adding env variables on Vercel, trigger a production redeploy so the new variables are baked into the build.

## Server changes we made
- Added server-side Google OAuth callback: `GET https://api.nbaurum.com/auth/google/callback` which exchanges code for tokens and redirects to the frontend with `?token=<JWT>`.
- Frontend automatically reads `?token=<JWT>` on the login page and logs-in the user.
- CORS is configured to allow `https://www.nbaurum.com` with credentials support.

## Healthcheck & verification
- Health check: `https://api.nbaurum.com/health` (should return a JSON success response)
- Test Google login flow:
  1. From `https://www.nbaurum.com` click "Sign in with Google".
  2. Complete Google consent (if prompted).
  3. Confirm redirect hits `https://api.nbaurum.com/auth/google/callback` and then you are redirected to `https://www.nbaurum.com?token=<JWT>` and auto-logged in.

## Restarting / deploying
- If you use PM2: `pm2 restart <process-name>` (or `pm2 restart all`)
- If you use Docker: rebuild and restart the backend container
- If you use systemd: `sudo systemctl restart your-backend.service`

## Notes
- Keep `GOOGLE_CLIENT_SECRET` private — do not commit to repo.
- If you prefer the token in a secure cookie instead of query param, we can implement that (requires cookie config changes).

---

If you'd like, I can also consolidate any remaining docs into this file and add examples specific to your hosting environment. Send me access details or tell me where you want the final content to be shortened further.