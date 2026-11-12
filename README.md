# BladeVault Auth

The Cloudflare Worker behind `https://auth.bladevault.pro`. It finishes Google sign-in for [BladeVault](https://github.com/dedkola/bladevault)'s Google Drive backup.

BladeVault uploads and downloads backups straight to the user's own Google Drive. Only two steps need the Google client secret: exchanging the sign-in code and refreshing access. Those two steps run here. The Worker stores nothing: tokens go straight back to the BladeVault server that asked, and no backup data passes through it.

## Routes

| Route                       | Called by           | Purpose                                                                 |
| --------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `GET /auth/drive/start`     | Sign-in popup       | Checks the request and redirects to Google with the `drive.file` scope. |
| `GET /auth/drive/callback`  | Google              | Sends the sign-in code back to the BladeVault window with `postMessage`. |
| `POST /auth/drive/token`    | BladeVault server   | Swaps the code and PKCE verifier for access and refresh tokens.        |
| `POST /auth/drive/refresh`  | BladeVault server   | Gets a new access token from a refresh token.                          |
| `GET /api/health`           | Monitoring          | Health check.                                                          |

BladeVault creates the PKCE verifier and keeps it on its own server, so a sign-in code that reaches anyone else cannot be exchanged. That is why `ALLOWED_CLIENT_ORIGINS` can stay `*`: self-hosted BladeVault servers run on any address.

BladeVault reads this service's address from `NEXT_PUBLIC_BLADEVAULT_AUTH_URL` and uses `https://auth.bladevault.pro` when it is unset.

## Configuration

| Name                     | Kind     | Notes                                                                         |
| ------------------------ | -------- | ----------------------------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`       | Secret   | Google OAuth web client.                                                      |
| `GOOGLE_CLIENT_SECRET`   | Secret   | Google OAuth web client.                                                      |
| `AUTH_PUBLIC_BASE_URL`   | Variable | This Worker's public address; the Google redirect URI is `<this>/auth/drive/callback`. |
| `ALLOWED_CLIENT_ORIGINS` | Variable | `*`, or a comma-separated list of origins (wildcards allowed). Local and private-network addresses are always allowed. |
| `SENTRY_DSN`             | Secret   | Optional. Error reporting is off without it; reports keep no tokens, codes or emails. |
| `SENTRY_ENVIRONMENT`     | Variable | Optional, defaults to `production`.                                           |

In the Google Cloud console, the OAuth client must list `https://auth.bladevault.pro/auth/drive/callback` as an authorised redirect URI.

## Development

```bash
npm ci
cp .dev.vars.example .dev.vars   # then fill in the values
npm run dev                      # http://localhost:8787
```

Point a local BladeVault at it with `NEXT_PUBLIC_BLADEVAULT_AUTH_URL=http://localhost:8787`.

```bash
npm run typecheck
npm run check      # bundles the Worker without deploying
```

## Deploying

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npm run deploy
```

The Worker keeps its original name, `bladevault-backend`, so deploying replaces the live code on `auth.bladevault.pro` and keeps its existing secrets and custom domain.

## License

MIT, see [LICENSE](LICENSE).
