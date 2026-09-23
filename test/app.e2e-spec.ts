import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app-module';

describe('Restock Priority API (e2e)', () => {
  let app: INestApplication;
  let createdId: string | undefined;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.enableShutdownHooks();
    await app.init();
  });

  afterAll(async () => {
    if (createdId) {
      await request(app.getHttpServer()).delete(`/parts/${createdId}`);
    }
    await app.close();
  });

  it('returns ok when the database is reachable', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('rejects an id that is not a UUID', () => {
    return request(app.getHttpServer()).get('/parts/not-a-uuid').expect(400);
  });

  it('paginates parts and rejects a limit above 100', async () => {
    const created = await request(app.getHttpServer())
      .post('/parts')
      .send({
        name: 'Paged Clamp',
        category: 'e2e-page',
        currentStock: 100,
        minimumStock: 1,
        averageDailySales: 0,
        leadTimeDays: 1,
        unitCost: 2,
        criticalityLevel: 1,
      })
      .expect(201);
    createdId = created.body.id as string;

    const page = await request(app.getHttpServer())
      .get('/parts')
      .query({ category: 'e2e-page', limit: 1 })
      .expect(200);

    expect(page.body).toMatchObject({ page: 1, limit: 1, total: 1 });
    expect(page.body.items).toHaveLength(1);
    expect(page.body.items[0].id).toBe(createdId);

    await request(app.getHttpServer()).get('/parts').query({ limit: 101 }).expect(400);

    await request(app.getHttpServer()).delete(`/parts/${createdId}`).expect(204);
    createdId = undefined;
  });

  it('creates a part, ranks it, and deletes it', async () => {
    const created = await request(app.getHttpServer())
      .post('/parts')
      .send({
        name: 'Oil Filter X',
        category: 'engine',
        currentStock: 15,
        minimumStock: 20,
        averageDailySales: 4,
        leadTimeDays: 5,
        unitCost: 18.5,
        criticalityLevel: 3,
      })
      .expect(201);

    createdId = created.body.id as string;

    const priorities = await request(app.getHttpServer()).get('/restock/priorities').expect(200);
    const item = priorities.body.priorities.find(
      (priority: { partId: string }) => priority.partId === createdId,
    );

    expect(item).toMatchObject({
      urgencyScore: 75,
      suggestedOrderQuantity: 25,
      moneyAtRisk: 462.5,
      projectedStock: -5,
      daysUntilStockout: 3.75,
    });

    await request(app.getHttpServer()).delete(`/parts/${createdId}`).expect(204);
    createdId = undefined;
  });
});
