# Contributing

Thanks for looking at restock-priority. This repository hosts two pieces:

- `packages/restock-priority` is the publishable prioritization engine. It has no NestJS or Prisma dependency.
- The NestJS application at the repository root is the reference HTTP API.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Prerequisites

- Node.js 20 or newer
- npm 10
- Docker, if you want PostgreSQL or the full Compose stack

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d db
npx prisma migrate dev
npm run start:dev
```

`npm install` builds the engine package. The API listens on `http://localhost:3000` and the OpenAPI UI is at `http://localhost:3000/docs`.

## Checks

```bash
npm run lint
npm test
npm run test:cov
npm run test:e2e
npm run build
```

`npm run test:e2e` needs `DATABASE_URL` pointing at PostgreSQL 16. Copy `.env.example` or export the variable yourself. The e2e setup runs `prisma migrate deploy`.

## Pull requests

1. Open an issue or pick one from [docs/good-first-issues.md](docs/good-first-issues.md).
2. Branch from `main`.
3. Keep the engine free of framework imports.
4. Add or update tests for behavior changes.
5. Run lint, unit tests, and the build. Run e2e when the HTTP contract or persistence changes.

Use the pull request template. A short summary of the behavior change is more useful than a list of files.

## Reporting security issues

Follow [SECURITY.md](SECURITY.md). Do not file a public issue for a vulnerability.
