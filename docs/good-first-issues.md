# Good first issues

These three tasks are intentionally left open. Each one is scoped to a small part of the HTTP API and does not require changing the prioritization formula.

## Correlation id

Add middleware that reads `X-Request-Id` or generates a UUID, stores it on the request, and returns it on the response. Log it from the Nest logger on each request. Cover the generated and the incoming-id paths with an e2e test.

## Rate limit

Add a per-IP limit on `POST /parts` and `GET /restock/priorities`. Return `429` with a `Retry-After` header when the limit is exceeded. Keep the limit configurable through an environment variable and document the default in `.env.example`.

## Commit the OpenAPI document

Add a script that boots the Nest application without listening, writes `openapi.json` at the repository root, and fails CI when the file is out of date. Contributors should be able to review contract changes in the pull request diff.
