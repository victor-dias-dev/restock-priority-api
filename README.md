# Karhub – Motor de Priorização de Reposição de Estoque

Microserviço para gerenciamento e priorização de reposição de peças automotivas.

## Tecnologias

- **Node.js** + **TypeScript**
- **NestJS** – framework HTTP
- **Prisma** – ORM
- **PostgreSQL** – banco de dados
- **Zod** – validação de DTOs
- **Jest** – testes unitários

## Pré-requisitos

- Node.js >= 18
- Docker e Docker Compose

## Como rodar localmente

### 1. Clone o repositório e instale as dependências

```bash
npm install
```

### 2. Suba o banco de dados

```bash
docker-compose up -d
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

O arquivo `.env` já vem configurado para o banco local do Docker:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/karhub"
```

### 4. Execute as migrations

```bash
npx prisma migrate dev --name init
```

### 5. Inicie o servidor

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Testes

```bash
npm run test
```

```bash
npm run test:cov   # com cobertura
```

## Endpoints

### Peças – CRUD

#### Criar peça
```http
POST /parts
Content-Type: application/json

{
  "name": "Filtro de Óleo X",
  "category": "engine",
  "currentStock": 15,
  "minimumStock": 20,
  "averageDailySales": 4,
  "leadTimeDays": 5,
  "unitCost": 18.50,
  "criticalityLevel": 3
}
```

#### Listar peças
```http
GET /parts
GET /parts?category=engine
```

#### Buscar peça por ID
```http
GET /parts/:id
```

#### Atualizar peça
```http
PUT /parts/:id
Content-Type: application/json

{
  "currentStock": 30
}
```

#### Remover peça
```http
DELETE /parts/:id
```

### Priorização

```http
GET /restock/priorities
```

Resposta:
```json
{
  "priorities": [
    {
      "partId": "uuid-1",
      "name": "Filtro de Óleo X",
      "currentStock": 15,
      "projectedStock": -5,
      "minimumStock": 20,
      "urgencyScore": 75
    }
  ]
}
```

## Regras de Negócio

| Fórmula | Cálculo |
|---|---|
| Consumo esperado | `averageDailySales x leadTimeDays` |
| Estoque projetado | `currentStock - expectedConsumption` |
| Necessidade de reposição | `projectedStock < minimumStock` |
| Score de urgência | `(minimumStock - projectedStock) x criticalityLevel` |

**Critérios de desempate** (quando `urgencyScore` é igual):
1. Maior `criticalityLevel`
2. Maior `averageDailySales`
3. Ordem alfabética pelo nome

## Arquitetura

```
src/
├── prisma/                  # PrismaModule global
├── common/pipes/            # ZodValidationPipe
└── modules/
    ├── parts/
    │   ├── controllers/     # HTTP layer
    │   ├── services/        # Regras de negócio CRUD
    │   ├── repositories/    # Abstração de banco (IPartsRepository)
    │   ├── domain/          # Entidade Part
    │   └── dto/             # Schemas Zod
    └── restock/
        ├── controllers/     # GET /restock/priorities
        ├── services/        # Orquestração
        └── domain/          # calculateRestockPriorities (função pura)
```

O cálculo de priorização é uma **função pura** (`priority-calculator.ts`) sem dependências do NestJS, tornando-o trivialmente testável e reutilizável.

Para trocar o banco de dados, basta alterar o `provider` no `prisma/schema.prisma` e o `useClass` no `PartsModule` — nenhuma alteração nos services ou controllers.
