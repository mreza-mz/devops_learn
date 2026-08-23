# DevOps Learn

Local **DevOps → SRE** training: daily Linux lessons, Docker labs in the browser, production scenarios, exams, scoring, and weak-topic review.

Persian RTL UI. English APIs, IDs, and database.

Works offline without an AI key. Labs need [Docker Desktop](https://www.docker.com/products/docker-desktop/).

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
| `npm run db:seed` | Seed 7-day curriculum |
| `npm run lab:build` | Build `devops-learn-lab:latest` |

Optional: `docker compose up --build`

Student containers never see the Docker socket. The API key never goes to the browser.

## Troubleshooting

- **Terminal won't connect** — start Docker Desktop, run `npm run lab:build`, keep port `3001` free.
- **Corrupt DB** — delete `prisma/dev.db`, then migrate and seed again.
- **No AvalAI key** — deterministic grading and seeded content still work.
