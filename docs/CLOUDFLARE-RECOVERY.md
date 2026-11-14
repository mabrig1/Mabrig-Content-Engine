# Cloudflare Workers recovery — MABRIG Content Engine

## Confirmed first blocker

The 2026-11-14 Cloudflare log says the installer ran `bun install`, then `next: not found`.
This is a pnpm workspace; Bun only installed the root package without the web workspace.
A missing tracked `pnpm-lock.yaml` made package-manager detection unreliable.

## Cloudflare Workers Builds — configuration required

In Cloudflare dashboard > Workers & Pages > mabrig-content-engine > Settings > Builds:

- Git repository: `mabrig1/Mabrig-Content-Engine`
- Root directory: repository root `/` (the pnpm workspace root)
- **Build variable** `SKIP_DEPENDENCY_INSTALL` = `1`
- Node.js: `22` (for example build variable `NODE_VERSION=22`)
- Build command:
  `pnpm install --no-frozen-lockfile && pnpm --filter @mabrig/web db:generate && pnpm --filter @mabrig/web cf:build`
- Deploy command (ONLY after dry-run and protected preview pass):
  `pnpm --filter @mabrig/web cf:deploy`
- Preview command (only after credentialless or sandbox smoke verification):
  `pnpm --filter @mabrig/web cf:upload`

Never use `bun install`, `npm run build`, `wrangler deploy` without an adapter, or a build output directory such as `dist` for this app.
The adapter generates `apps/web/.open-next/worker.js` and assets.

This branch migrates to supported Next.js 15.5.29 / OpenNext and replaces the native Prisma engine with the JavaScript PostgreSQL adapter.
**Node build passing does not prove Workers runtime/database compatibility**.
Use a test DB and a staging Worker preview; do not attach or publish the production domain until login and auth/session isolation pass.

## Required configuration

Set `DATABASE_URL` for a reachable PostgreSQL database through a supported route;
Cloudflare Hyperdrive is recommended for production pooling, but needs an account-side
Hyperdrive setup and binding. Configure `NEXTAUTH_SECRET` as a random value of at least
32 characters, `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with the correct origin.
Keep API credentials (OpenAI, Anthropic, etc.) in server-side secrets.

Build-time configuration and runtime secrets are distinct in Workers Builds: set both where needed, never commit them to Git.
Run migrations through your database migration workflow, never automatically in a public Worker build.

## Gate before production

1. Ensure pnpm workspace dependency install and Prisma generate succeed.
2. Check `pnpm --filter @mabrig/web build` passes.
3. Check `pnpm --filter @mabrig/web cf:dry-run` passes and report bundle size.
4. Preview with `pnpm --filter @mabrig/web cf:preview`, test auth/cookies, new draft, calendar, CRM.
5. Verify cross-workspace isolation and database connectivity before connecting the custom domain.
6. Roll back Worker to previous deployment immediately if health checks fail.

The previously implemented Campaign Studio is in PR #3; this branch is based on that code
and is not merged into the repository default branch.
