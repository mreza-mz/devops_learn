# DevOps Learn

Local **DevOps → SRE** training: daily Linux lessons, Docker labs in the browser, production scenarios, exams, scoring, and weak-topic review.

Persian RTL UI. English APIs, IDs, and database.

Works offline without an AI key. Labs need [Docker Desktop](https://www.docker.com/products/docker-desktop/).

## Prerequisites

Install these on your system before running the project:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/products/docker-desktop/) (Docker Desktop)

## Quick start

```powershell
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run lab:build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

| Account | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Learner | `learner` | `learner123` |

Change these after first login.

## Stack

Next.js · Prisma/SQLite · Docker sandbox · xterm.js · optional [AvalAI](https://avalai.ir)

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | App + terminal gateway |
| `npm run test` | Vitest |
| `npm run db:seed` | Seed 38-day curriculum (Linux → SRE) |
| `npm run db:export -- [out.db]` | Export SQLite backup (progress + lessons) |
| `npm run db:import -- <backup.db>` | Restore a previous backup |
| `npm run lab:build` | Build `devops-learn-lab:latest` |

Optional: `docker compose up --build`

Student containers never see the Docker socket. The API key never goes to the browser.

## Troubleshooting

- **Terminal won't connect** — start Docker Desktop, run `npm run lab:build`, keep port `3001` free.
- **Corrupt DB** — delete `prisma/dev.db`, then migrate and seed again. Or restore a backup from Settings / `npm run db:import`.
- **Move to another machine** — Settings → export DB, copy the `.db` file, then import (or `npm run db:import -- backup.db`).
- **No AvalAI key** — deterministic grading and seeded content still work.
