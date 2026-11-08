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
| `npm run db:seed` | Seed 47-day curriculum (Linux → SRE → platform tools from web sources) |
| `npm run db:export -- [out.db]` | Export SQLite backup (progress + lessons) |
| `npm run db:import -- <backup.db>` | Restore a previous backup |
| `npm run lab:build` | Build `devops-learn-lab:latest` (includes Go for the Backend track) |
| `npm run labs:verify` | Check every Go lab: starter compiles and fails, reference solution passes `go vet` + `go test -race` (needs local Go ≥ 1.22 and gcc) |

Optional: `docker compose up --build`

## Backend → Go track

50 days in 8 modules (Go fundamentals → concurrency → DSA → problem solving → databases → system design → backend with Go → interviews).
Core Go days end in a **real coding lab**: starter code and tests are written to `~/labs/<name>` in the sandbox, and the exercise passes only when the tests are untouched, `go vet` is clean and `go test` (with `-race` for concurrency labs) passes.

- Lab sources: `prisma/seed/tracks/backend/labs/<name>/` (`*.go` starter, `*_test.go` spec, `solution/` reference — never copied into the sandbox)
- Add a lab: create the folder, wire it with `goLab()` in the module file, then run `npm run labs:verify` and `npm test`
- Labs run offline (`--network none`): standard library only
- If `npm run lab:build` fails with `403 Forbidden` from Docker Hub (common in Iran), add a registry mirror in Docker Desktop → Settings → Docker Engine, e.g. `"registry-mirrors": ["https://docker.arvancloud.ir", "https://mirror-docker.runflare.com"]`, then Apply & restart. Alternatively pass `--build-arg BASE_IMAGE=docker.arvancloud.ir/library/ubuntu:24.04`; `--build-arg APT_MIRROR=<ubuntu mirror>` (amd64) helps if the Ubuntu archive is unreachable
- After pulling these changes run `npm run lab:build` once, then `npm run db:seed`. Backend day numbers changed (45 → 50 days), so progress recorded on the old Backend days will point at different lessons; reseed on a fresh database if that matters.

Student containers never see the Docker socket. The API key never goes to the browser.

## Troubleshooting

- **Terminal won't connect** — start Docker Desktop, run `npm run lab:build`, keep port `3001` free.
- **Corrupt DB** — delete `prisma/dev.db`, then migrate and seed again. Or restore a backup from Settings / `npm run db:import`.
- **Move to another machine** — Settings → export DB, copy the `.db` file, then import (or `npm run db:import -- backup.db`).
- **No AvalAI key** — deterministic grading and seeded content still work.
