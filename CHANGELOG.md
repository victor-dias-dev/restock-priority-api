# Changelog

## 1.0.0

- Publish the prioritization rules as the `restock-priority` package.
- Report suggested order quantity, days until stockout, and money at risk alongside the urgency score.
- Require PostgreSQL 16, paginate `GET /parts`, and validate part ids as UUIDs.
- Add a health check, graceful shutdown, OpenAPI schemas generated from Zod, Docker, and CI.
