# MABRIG Content Engine

> AI-powered Social Media CRM & Content Automation Platform

A production-ready platform for creators and agencies to schedule content, manage audiences, generate AI captions, and scale their social media presence.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-Platform Posting** | Facebook, Instagram, X/Twitter, LinkedIn, TikTok, YouTube, Pinterest, Threads, Telegram |
| **AI Content Engine** | GPT-4o & Claude — captions, hooks, hashtags, headlines, threads, video scripts |
| **Content Scheduling** | Draft → Schedule → Publish with evergreen recycling |
| **CRM System** | Contacts, lead scoring, tagging, interaction history |
| **Media Library** | Upload & organize images, videos, GIFs with AI metadata |
| **Analytics Dashboard** | Post performance, engagement, audience growth |
| **Automation Workflows** | Event-driven automation pipelines |
| **Multi-tenant** | Workspace architecture for agencies |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Radix UI |
| Database | PostgreSQL + Prisma ORM |
| Cache/Queue | Redis + Bull |
| AI | OpenAI GPT-4o + Anthropic Claude |
| Auth | JWT + bcrypt |
| DevOps | Docker + GitHub Actions |
| Monorepo | pnpm workspaces + Turborepo |

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm@9`)
- PostgreSQL 16+ and Redis 7+ (or use Docker)

### 1. Clone & Install

```bash
git clone https://github.com/mabrig1/mabrig-content-engine.git
cd mabrig-content-engine
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your values (at minimum: `DATABASE_URL`, `NEXTAUTH_SECRET`).

### 3. Start Databases

```bash
docker-compose up -d postgres redis
```

### 4. Database Setup

```bash
# Push schema to database
cd packages/database && npx prisma db push

# Or run migrations
npx prisma migrate dev --name init
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — register an account and start creating!

---

## Docker (Full Stack)

```bash
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET, OPENAI_API_KEY, etc.

docker-compose up -d --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT secret (min 32 characters) |
| `NEXTAUTH_URL` | ✅ | App URL (e.g. `http://localhost:3000`) |
| `OPENAI_API_KEY` | | OpenAI for AI content generation |
| `ANTHROPIC_API_KEY` | | Claude for AI content generation |
| `GOOGLE_CLIENT_ID/SECRET` | | Google OAuth login |
| `GITHUB_CLIENT_ID/SECRET` | | GitHub OAuth login |
| `FACEBOOK_APP_ID/SECRET` | | Facebook posting |
| `INSTAGRAM_APP_ID/SECRET` | | Instagram posting |
| `TWITTER_CLIENT_ID/SECRET` | | X/Twitter posting |
| `LINKEDIN_CLIENT_ID/SECRET` | | LinkedIn posting |
| `TIKTOK_CLIENT_KEY/SECRET` | | TikTok posting |

See `.env.example` for the full list.

---

## Project Structure

```
mabrig-content-engine/
├── apps/
│   └── web/                        # Next.js 14 application
│       └── src/
│           ├── app/
│           │   ├── (auth)/         # Login / Register pages
│           │   ├── (dashboard)/    # Main app (compose, calendar, crm, etc.)
│           │   └── api/            # REST API routes
│           ├── components/         # React components
│           │   ├── compose/        # Content composer + AI panel
│           │   ├── dashboard/      # Dashboard stats & widgets
│           │   ├── layout/         # Sidebar + TopBar
│           │   └── settings/       # Settings tabs
│           ├── lib/                # auth, prisma, utils, api client
│           └── types/              # TypeScript interfaces
├── packages/
│   ├── database/                   # Prisma schema + client singleton
│   ├── shared/                     # Shared types, constants, utilities
│   └── ai/                         # AI service abstraction layer
├── docker/
│   └── Dockerfile.web              # Multi-stage production Dockerfile
├── .github/
│   └── workflows/ci.yml            # GitHub Actions CI pipeline
├── docker-compose.yml              # Full local stack
├── .env.example                    # Environment variable template
└── README.md
```

---

## API Reference

### Authentication
```
POST /api/auth/register    Register new account
POST /api/auth/login       Login
POST /api/auth/logout      Logout
GET  /api/auth/me          Current session
```

### Posts
```
GET    /api/posts           List posts (filter by status, paginated)
POST   /api/posts           Create post (draft or scheduled)
GET    /api/posts/:id       Get single post
PATCH  /api/posts/:id       Update post
DELETE /api/posts/:id       Delete post
```

### AI Generation
```
POST /api/ai/generate       Generate content
  body: { type, topic, tone, model, platform?, extraContext? }
  types: CAPTION | HOOK | HASHTAGS | CTA | HEADLINE | STORY | THREAD | VIDEO_SCRIPT
  tones: motivational | prophetic | inspirational | business | storytelling | educational | humorous | professional
  models: openai | claude
```

### CRM
```
GET  /api/crm/contacts      List contacts (search, filter, paginate)
POST /api/crm/contacts      Create contact
```

### Social Accounts
```
GET  /api/social-accounts   List connected accounts
POST /api/social-accounts   Connect account (manual/OAuth)
```

### Analytics
```
GET /api/analytics/dashboard   Dashboard stats summary
```

### Media
```
GET /api/media              List media (filter by type, paginate)
```

---

## Deployment

### Vercel
```bash
npx vercel --prod
```
Set all environment variables in Vercel dashboard.

### Railway
1. Connect GitHub repo
2. Set environment variables
3. Add PostgreSQL and Redis plugins

### VPS / Self-hosted
```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## Roadmap

- [ ] Real OAuth flows for all 9 social platforms
- [ ] Drag-and-drop content calendar
- [ ] Real-time analytics sync with platform APIs
- [ ] AI image generation (DALL-E 3, Stable Diffusion)
- [ ] Team collaboration & approval workflows
- [ ] White-label / custom domain support
- [ ] Mobile app (React Native)
- [ ] MCP agent integration for autonomous posting
- [ ] Stripe billing / subscription management

---

## License

MIT License — Built by MABRIG
