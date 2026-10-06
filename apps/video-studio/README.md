# MABRIG Video Studio

This is the canonical in-repository home of the former standalone `mabrig1/aivideo` application.

The product is now consolidated inside the MABRIG Content Engine monorepo at `apps/video-studio`.

## Local development

```bash
pnpm install
pnpm --filter @mabrig/video-studio dev
```

The Video Studio runs on port 3001. The main Content Engine web app runs on port 3000.

## Hosting direction

Vercel is the canonical web deployment target. Cloudflare/OpenNext deployment files from the legacy repository were deliberately not migrated. The GPU worker remains external because long-running video generation is not suitable for a normal Vercel request lifecycle.

## Migration safety

Do not archive or delete `mabrig1/aivideo` until this branch is verified and any open draft work there has been ported or closed.
