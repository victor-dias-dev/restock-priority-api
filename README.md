# restock-priority

[Português](README.pt.md)

[![CI](https://github.com/victor-dias-dev/test-karhub/actions/workflows/ci.yml/badge.svg)](https://github.com/victor-dias-dev/test-karhub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/victor-dias-dev/test-karhub)](LICENSE)

Reference HTTP API for stock replenishment prioritization, plus a publishable engine with no framework dependencies.

The ranking rule lives in [`packages/restock-priority`](packages/restock-priority). Criticality decides who jumps the queue. Unit cost is reported as money at risk so a buyer can override that order; it does not change the sort.

## Requirements

- Node.js >= 20
- npm 10
- PostgreSQL 16

The schema uses `gen_random_uuid()` and `@db.Uuid`. PostgreSQL is a requirement of this API, not a swappable Prisma provider.

## Run locally

```bash
npm install
cp .env.example .env
docker compose up -d db
npx prisma migrate dev
npm run start:dev
```

The API listens on `http://localhost:3000`. OpenAPI is at `http://localhost:3000/docs`.

`npm install` builds the engine. To run the API and PostgreSQL together:

```bash
docker compose up --build
```

## Tests

```bash
npm test
npm run test:cov
npm run test:e2e
```

End-to-end tests need `DATABASE_URL`. The default in `.env.example` matches the Compose database.

## Endpoints

### Parts

`POST /parts` creates a part.

```json
{
  "name": "Oil Filter X",
  "category": "engine",
  "currentStock": 15,
  "minimumStock": 20,
  "averageDailySales": 4,
  "leadTimeDays": 5,
  "unitCost": 18.5,
  "criticalityLevel": 3
}
```

`GET /parts?category=engine&page=1&limit=20` returns a page:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

`limit` defaults to 20 and cannot exceed 100. `GET /parts/:id` and `PUT /parts/:id` use the same fields. `:id` must be a UUID. `DELETE /parts/:id` returns `204` with an empty body.

### Priorities

`GET /restock/priorities` ranks every part that will fall below its minimum during the lead time. The list is not paginated; `GET /parts` is.

```json
{
  "priorities": [
    {
      "partId": "uuid",
      "name": "Oil Filter X",
      "currentStock": 15,
      "projectedStock": -5,
      "minimumStock": 20,
      "urgencyScore": 75,
      "suggestedOrderQuantity": 25,
      "daysUntilStockout": 3.75,
      "moneyAtRisk": 462.5
    }
  ]
}
```

### Health

`GET /health` returns `200` and `{ "status": "ok" }` when PostgreSQL answers `SELECT 1`. It returns `503` when the database is unreachable.

## Business rules

| Formula | Calculation |
|---|---|
| Expected consumption | `averageDailySales * leadTimeDays` |
| Projected stock | `currentStock - expectedConsumption` |
| Needs replenishment | `projectedStock < minimumStock` |
| Urgency score | `(minimumStock - projectedStock) * criticalityLevel` |
| Suggested order quantity | `ceil(minimumStock - projectedStock)` |
| Days until stockout | `currentStock / averageDailySales`, or `null` when daily sales are 0 |
| Money at risk | `(minimumStock - projectedStock) * unitCost` |

Tie breakers, in order: higher `criticalityLevel`, higher `averageDailySales`, then `name` ascending.

Worked example: stock 15, minimum 20, daily sales 4, lead time 5, unit cost 18.50, criticality 3. Expected consumption is 20, projected stock is -5, the score is 75, the suggested order is 25, days until stockout is 3.75, and money at risk is 462.50.

## Layout

```
packages/restock-priority/   # pure engine, publishable
src/
  prisma/                    # PrismaModule
  common/                    # Zod pipe and OpenAPI helper
  modules/
    parts/                   # CRUD
    restock/                 # GET /restock/priorities
    health/                  # GET /health
```

## License

[MIT](LICENSE) © Victor Dias
