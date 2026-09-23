# restock-priority

[English](README.md)

[![CI](https://github.com/victor-dias-dev/test-karhub/actions/workflows/ci.yml/badge.svg)](https://github.com/victor-dias-dev/test-karhub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/victor-dias-dev/test-karhub)](LICENSE)

API HTTP de referência para priorização de reposição de estoque, com um motor publicável e sem dependência de framework.

A regra de ordenação fica em [`packages/restock-priority`](packages/restock-priority). A criticidade decide quem fura a fila. O custo unitário aparece como dinheiro em risco para o comprador poder ignorar essa ordem; ele não muda a ordenação.

## Requisitos

- Node.js >= 20
- npm 10
- PostgreSQL 16

O schema usa `gen_random_uuid()` e `@db.Uuid`. PostgreSQL é requisito desta API.

## Rodar localmente

```bash
npm install
cp .env.example .env
docker compose up -d db
npx prisma migrate dev
npm run start:dev
```

A API sobe em `http://localhost:3000`. O OpenAPI fica em `http://localhost:3000/docs`.

`npm install` compila o motor. Para subir a API e o PostgreSQL juntos:

```bash
docker compose up --build
```

## Testes

```bash
npm test
npm run test:cov
npm run test:e2e
```

Os testes de ponta a ponta precisam de `DATABASE_URL`. O valor de `.env.example` corresponde ao banco do Compose.

## Endpoints

### Peças

`POST /parts` cria uma peça.

```json
{
  "name": "Filtro de Óleo X",
  "category": "engine",
  "currentStock": 15,
  "minimumStock": 20,
  "averageDailySales": 4,
  "leadTimeDays": 5,
  "unitCost": 18.5,
  "criticalityLevel": 3
}
```

`GET /parts?category=engine&page=1&limit=20` devolve uma página:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0
}
```

`limit` vale 20 por padrão e não passa de 100. `GET /parts/:id` e `PUT /parts/:id` usam os mesmos campos. `:id` precisa ser um UUID. `DELETE /parts/:id` responde `204` sem corpo.

### Prioridades

`GET /restock/priorities` ordena toda peça que fica abaixo do mínimo durante o lead time. Essa lista não é paginada; `GET /parts` é.

```json
{
  "priorities": [
    {
      "partId": "uuid",
      "name": "Filtro de Óleo X",
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

### Saúde

`GET /health` responde `200` e `{ "status": "ok" }` quando o PostgreSQL responde `SELECT 1`. Responde `503` quando o banco não está acessível.

## Regras de negócio

| Fórmula | Cálculo |
|---|---|
| Consumo esperado | `averageDailySales * leadTimeDays` |
| Estoque projetado | `currentStock - expectedConsumption` |
| Precisa repor | `projectedStock < minimumStock` |
| Score de urgência | `(minimumStock - projectedStock) * criticalityLevel` |
| Quantidade sugerida | `ceil(minimumStock - projectedStock)` |
| Dias até a ruptura | `currentStock / averageDailySales`, ou `null` se o giro for 0 |
| Dinheiro em risco | `(minimumStock - projectedStock) * unitCost` |

Desempate, nesta ordem: maior `criticalityLevel`, maior `averageDailySales`, depois `name` em ordem crescente.

Exemplo: estoque 15, mínimo 20, giro 4, lead time 5, custo 18,50, criticidade 3. O consumo esperado é 20, o estoque projetado é -5, o score é 75, o pedido sugerido é 25, os dias até a ruptura são 3,75 e o dinheiro em risco é 462,50.

## Estrutura

```
packages/restock-priority/   # motor puro, publicável
src/
  prisma/                    # PrismaModule
  common/                    # pipe Zod e helper OpenAPI
  modules/
    parts/                   # CRUD
    restock/                 # GET /restock/priorities
    health/                  # GET /health
```

## Licença

[MIT](LICENSE) © Victor Dias
