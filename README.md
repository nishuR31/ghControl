# GH Control 🚀

> Full GitHub command center — Next.js 14, MongoDB, Redis, BullMQ

Built for **nishuR31** — control everything GitHub from one dark terminal UI.

---

## Features

### GitHub Operations (via Octokit)
| Feature | Operations |
|---------|-----------|
| **Repos** | List, create, update, delete, fork, clone URL |
| **Branches** | List, create, delete, protection info |
| **Commits** | Browse history, filter by author/path/SHA, compare |
| **Issues** | List, create, close/reopen, comment, labels, assignees |
| **Pull Requests** | List, create, merge (merge/squash/rebase), review, comment |
| **Releases** | List, create draft/prerelease, tag management |
| **GitHub Actions** | List workflows, view runs, trigger, cancel, re-run |
| **Webhooks** | List, create, delete, ping, receive & store events |
| **Search** | Repos, code, issues/PRs, users |
| **Stars** | View starred repos, star/unstar |
| **Gists** | List, create public/private |
| **Notifications** | View, mark read |
| **Labels** | List, create |
| **Rate Limit** | Monitor API usage |

### Infrastructure
- **Redis** — Response caching (users, repos, search)
- **BullMQ** — Async job queue with retry, backoff, deduplication
- **MongoDB** — Webhook event storage, job logs, notes, saved searches
- **LocalStorage** — Token, user session, last-used repo per tab

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)
- Redis running locally (`redis-server`)

### 1. Install
```bash
cd gh-control
npm install
```

### 2. Configure
```bash
cp .env.example .env
# Edit .env — MongoDB URI, Redis URL, webhook secret
```

### 3. Run

```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: BullMQ worker (for async jobs)
npm run worker

# Or both together:
npm run dev:all
```

App → http://localhost:3000

---

## GitHub Token

Generate at **https://github.com/settings/tokens/new**

Required scopes:
- `repo` — full repo access (read/write)
- `read:user` — profile
- `admin:repo_hook` — webhook management
- `notifications` — notifications
- `gist` — gist management
- `delete_repo` — to delete repos (optional)

Token is stored in **localStorage** only — never sent to any external server, only proxied through your own Express backend to the GitHub API.

---

## Architecture

```
gh-control/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github/
│   │   │   │   ├── user/route.ts          GET  — authenticated user
│   │   │   │   ├── repos/route.ts         GET list / POST create
│   │   │   │   ├── repos/[owner]/[repo]/
│   │   │   │   │   ├── route.ts           GET / PATCH / DELETE
│   │   │   │   │   ├── branches/route.ts  GET / POST / DELETE
│   │   │   │   │   ├── commits/route.ts   GET (compare supported)
│   │   │   │   │   ├── issues/route.ts    GET / POST
│   │   │   │   │   ├── issues/[n]/route.ts GET / PATCH / POST comment
│   │   │   │   │   ├── pulls/route.ts     GET / POST
│   │   │   │   │   ├── pulls/[n]/route.ts  GET / PUT merge / POST review
│   │   │   │   │   ├── releases/route.ts  GET / POST
│   │   │   │   │   ├── actions/route.ts   GET workflows+runs / POST trigger
│   │   │   │   │   ├── webhooks/route.ts  GET / POST (create/ping/delete)
│   │   │   │   │   └── labels/route.ts    GET / POST
│   │   │   │   ├── search/route.ts        GET ?type=repos|issues|code|users
│   │   │   │   ├── stars/route.ts         GET list / POST star/unstar
│   │   │   │   ├── gists/route.ts         GET / POST create
│   │   │   │   ├── notifications/route.ts GET / POST mark_read
│   │   │   │   ├── rate-limit/route.ts    GET
│   │   │   │   └── jobs/route.ts          GET logs / POST enqueue
│   │   │   └── webhooks/
│   │   │       ├── receive/route.ts       POST — GitHub → MongoDB + BullMQ
│   │   │       └── events/route.ts        GET — list stored events
│   │   ├── page.tsx                       Full dashboard UI
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── github.ts                      All Octokit wrappers
│   │   ├── mongodb.ts                     Mongoose connection
│   │   ├── redis.ts                       IORedis + cache helpers
│   │   ├── queues.ts                      BullMQ queue definitions
│   │   ├── models.ts                      Mongoose schemas
│   │   └── api.ts                         API utilities
│   └── worker/
│       └── index.js                       BullMQ worker process
├── .env.example
├── package.json
└── README.md
```

## API Usage (from curl/Postman)

All API routes accept `x-github-token: ghp_xxx` header.

```bash
# Get user
curl http://localhost:3000/api/github/user \
  -H "x-github-token: ghp_xxx"

# List repos
curl "http://localhost:3000/api/github/repos?sort=updated&type=all" \
  -H "x-github-token: ghp_xxx"

# Create issue
curl -X POST http://localhost:3000/api/github/repos/owner/repo/issues \
  -H "x-github-token: ghp_xxx" \
  -H "Content-Type: application/json" \
  -d '{"title": "Bug found", "body": "Details here", "labels": ["bug"]}'

# Search repos
curl "http://localhost:3000/api/github/search?q=nodejs+express&type=repos" \
  -H "x-github-token: ghp_xxx"

# Enqueue async job
curl -X POST http://localhost:3000/api/github/jobs \
  -H "x-github-token: ghp_xxx" \
  -H "Content-Type: application/json" \
  -d '{"type": "create_branch", "owner": "me", "repo": "myrepo", "branch": "feature/x", "from": "main"}'
```

## Webhook Setup

Point any GitHub repo webhook to:
```
http://your-server:3000/api/webhooks/receive
```

Events are stored in MongoDB and viewable in the **Webhook Events** tab.

Set `GITHUB_WEBHOOK_SECRET` in `.env` for signature verification.
