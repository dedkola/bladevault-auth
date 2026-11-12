# Contributing

Thanks for helping improve BladeVault Auth! This repo holds only the Google Drive sign-in Worker. For the BladeVault app itself, head to [dedkola/bladevault](https://github.com/dedkola/bladevault).

## Getting started

```bash
npm ci
cp .dev.vars.example .dev.vars   # then fill in the values
npm run dev                      # http://localhost:8787
```

## Before opening a pull request

```bash
npm run typecheck
npm run check      # bundles the Worker without deploying
```

Both run in CI on every pull request.

## Guidelines

- Keep the Worker stateless: never store tokens, codes or user data.
- Never log or send tokens, codes or emails to Sentry.
- Keep changes small and focused, and explain the why in the pull request.
- Security issues go through [SECURITY.md](SECURITY.md), not public issues.
