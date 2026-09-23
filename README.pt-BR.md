# restock-priority

[English](README.md)

[![CI](https://github.com/victor-dias-dev/test-karhub/actions/workflows/ci.yml/badge.svg)](https://github.com/victor-dias-dev/test-karhub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Reposição de estoque de peças: quem comprar primeiro, quantas unidades, e quanto dinheiro fica em risco enquanto o pedido está a caminho.

A criticidade decide quem fura a fila. O custo unitário aparece como dinheiro em risco para o comprador poder ignorar essa ordem. Ele não muda a ordenação. A regra fica em [`packages/restock-priority`](packages/restock-priority) e não importa NestJS nem Prisma.

![API](docs/screenshots/api.png)
![Prioridades](docs/screenshots/priorities.png)
![Peças](docs/screenshots/parts.png)

## O que o app cobre

- Peças: criar, listar, buscar, atualizar e remover
- `GET /parts` paginado (`page`, `limit` até 100, `category` opcional)
- `GET /restock/priorities` para toda peça que fica abaixo do mínimo durante o lead time
- Quantidade sugerida, dias até a ruptura e dinheiro em risco
- `GET /health` contra o PostgreSQL
- OpenAPI em `/docs`

## Requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose

PostgreSQL 16 é requisito. O schema usa `gen_random_uuid()` e `@db.Uuid`.

## Como subir

```bash
npm install
cp .env.example .env
docker compose up -d db
npx prisma migrate dev
npm run start:dev
```

`npm install` compila o motor. A API sobe em http://localhost:3000. Swagger: http://localhost:3000/docs. Saúde: `GET /health`.

Para subir a API e o PostgreSQL juntos: `docker compose up --build`.

A API lê `PORT` e `DATABASE_URL` do ambiente. Copie `.env.example` e deixe segredo real fora do git.

| Variável       | Função                              |
| -------------- | ----------------------------------- |
| `PORT`         | Porta HTTP. O padrão é `3000`       |
| `DATABASE_URL` | String de conexão do PostgreSQL     |

## Verificação

```bash
npm test
npm run test:e2e
npm run lint
npm run build
```

Os testes e2e exigem PostgreSQL e `DATABASE_URL`. O valor de `.env.example` corresponde ao banco do Compose. Cobertura: `npm run test:cov`.

## Repositório

```text
packages/restock-priority   Motor de ordenação, publicável
src/modules/parts           CRUD de peças
src/modules/restock         GET /restock/priorities
src/modules/health          GET /health
```

O consumo esperado é `averageDailySales * leadTimeDays`. O estoque projetado é `currentStock - expectedConsumption`. A peça precisa de reposição quando o estoque projetado fica abaixo de `minimumStock`.

O score de urgência é `(minimumStock - projectedStock) * criticalityLevel`. A quantidade sugerida é `ceil(minimumStock - projectedStock)`. Os dias até a ruptura são `currentStock / averageDailySales`, ou `null` se o giro for 0. O dinheiro em risco é `(minimumStock - projectedStock) * unitCost`.

O desempate é maior criticidade, depois maior giro diário, depois o nome em ordem crescente.

Exemplo: estoque 15, mínimo 20, giro 4, lead time 5, custo 18,50, criticidade 3. O estoque projetado é -5, o score é 75, o pedido sugerido é 25, os dias até a ruptura são 3,75 e o dinheiro em risco é 462,50.

## Contribuição

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Falha de segurança está descrita em [SECURITY.md](SECURITY.md).

Licença [MIT](LICENSE).
