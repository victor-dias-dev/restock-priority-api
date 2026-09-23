import { calculateRestockPriorities, PartInput } from './priority-calculator';

function makePart(overrides: Partial<PartInput> & { id: string; name: string }): PartInput {
  return {
    currentStock: 10,
    minimumStock: 20,
    averageDailySales: 2,
    leadTimeDays: 3,
    unitCost: 50,
    criticalityLevel: 3,
    ...overrides,
  };
}

describe('calculateRestockPriorities', () => {
  it('returns empty array when input is empty', () => {
    expect(calculateRestockPriorities([])).toEqual([]);
  });

  it('includes part that needs restock (projectedStock < minimumStock)', () => {
    const part = makePart({
      id: '1',
      name: 'Oil Filter',
      currentStock: 10,
      minimumStock: 20,
      averageDailySales: 2,
      leadTimeDays: 3,
    });
    const result = calculateRestockPriorities([part]);
    expect(result).toHaveLength(1);
    expect(result[0].partId).toBe('1');
    expect(result[0].projectedStock).toBe(4);
    expect(result[0].urgencyScore).toBe((20 - 4) * 3);
    expect(result[0].suggestedOrderQuantity).toBe(16);
    expect(result[0].daysUntilStockout).toBe(5);
    expect(result[0].moneyAtRisk).toBe(800);
  });

  it('excludes part with sufficient stock (projectedStock >= minimumStock)', () => {
    const part = makePart({
      id: '1',
      name: 'Shock absorber',
      currentStock: 100,
      minimumStock: 5,
      averageDailySales: 1,
      leadTimeDays: 2,
    });
    expect(calculateRestockPriorities([part])).toEqual([]);
  });

  it('returns empty array when all parts are above threshold', () => {
    const parts = [
      makePart({
        id: '1',
        name: 'A',
        currentStock: 50,
        minimumStock: 5,
        averageDailySales: 1,
        leadTimeDays: 1,
      }),
      makePart({
        id: '2',
        name: 'B',
        currentStock: 80,
        minimumStock: 10,
        averageDailySales: 2,
        leadTimeDays: 2,
      }),
    ];
    expect(calculateRestockPriorities(parts)).toEqual([]);
  });

  it('handles negative projectedStock correctly', () => {
    const part = makePart({
      id: '1',
      name: 'Brake pad',
      currentStock: 5,
      minimumStock: 20,
      averageDailySales: 4,
      leadTimeDays: 5,
    });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(-15);
    expect(result[0].urgencyScore).toBe(105);
    expect(result[0].suggestedOrderQuantity).toBe(35);
    expect(result[0].moneyAtRisk).toBe(1750);
  });

  it('handles zero averageDailySales (projectedStock equals currentStock)', () => {
    const part = makePart({
      id: '1',
      name: 'Spark plug',
      currentStock: 5,
      minimumStock: 10,
      averageDailySales: 0,
      leadTimeDays: 7,
    });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(5);
    expect(result[0].urgencyScore).toBe((10 - 5) * 3);
    expect(result[0].daysUntilStockout).toBeNull();
  });

  it('handles leadTimeDays = 0 (no consumption)', () => {
    const part = makePart({
      id: '1',
      name: 'Timing belt',
      currentStock: 3,
      minimumStock: 10,
      averageDailySales: 5,
      leadTimeDays: 0,
    });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(3);
    expect(result[0].suggestedOrderQuantity).toBe(7);
  });

  it('handles currentStock = 0', () => {
    const part = makePart({
      id: '1',
      name: 'Radiator',
      currentStock: 0,
      minimumStock: 5,
      averageDailySales: 1,
      leadTimeDays: 3,
    });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(-3);
    expect(result[0].urgencyScore).toBe((5 - -3) * 3);
    expect(result[0].daysUntilStockout).toBe(0);
    expect(result[0].suggestedOrderQuantity).toBe(8);
  });

  it('rounds a fractional replenishment gap up to a whole order quantity', () => {
    const part = makePart({
      id: '1',
      name: 'Hose',
      currentStock: 0,
      minimumStock: 1,
      averageDailySales: 1.5,
      leadTimeDays: 1,
      unitCost: 2,
    });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(-1.5);
    expect(result[0].suggestedOrderQuantity).toBe(3);
    expect(result[0].moneyAtRisk).toBe(5);
  });

  it('sorts by urgencyScore descending', () => {
    const parts = [
      makePart({
        id: '1',
        name: 'A',
        currentStock: 5,
        minimumStock: 10,
        averageDailySales: 1,
        leadTimeDays: 1,
        criticalityLevel: 1,
      }),
      makePart({
        id: '2',
        name: 'B',
        currentStock: 2,
        minimumStock: 10,
        averageDailySales: 1,
        leadTimeDays: 1,
        criticalityLevel: 5,
      }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result[0].partId).toBe('2');
    expect(result[1].partId).toBe('1');
  });

  it('tiebreaker 1: higher criticalityLevel wins when urgencyScore is equal', () => {
    const tieparts = [
      makePart({
        id: 'A',
        name: 'Zz Part',
        currentStock: 0,
        minimumStock: 20,
        averageDailySales: 0,
        leadTimeDays: 0,
        criticalityLevel: 2,
      }),
      makePart({
        id: 'B',
        name: 'Aa Part',
        currentStock: 0,
        minimumStock: 8,
        averageDailySales: 0,
        leadTimeDays: 0,
        criticalityLevel: 5,
      }),
    ];
    const result = calculateRestockPriorities(tieparts);
    expect(result[0].partId).toBe('B');
    expect(result[1].partId).toBe('A');
  });

  it('tiebreaker 2: higher averageDailySales wins when urgencyScore and criticalityLevel are equal', () => {
    const parts = [
      makePart({
        id: 'low-sales',
        name: 'Bolt',
        currentStock: 0,
        minimumStock: 15,
        averageDailySales: 1,
        leadTimeDays: 0,
        criticalityLevel: 3,
      }),
      makePart({
        id: 'high-sales',
        name: 'Nut',
        currentStock: 0,
        minimumStock: 15,
        averageDailySales: 5,
        leadTimeDays: 0,
        criticalityLevel: 3,
      }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result[0].partId).toBe('high-sales');
    expect(result[1].partId).toBe('low-sales');
  });

  it('tiebreaker 3: alphabetical order when urgencyScore, criticalityLevel and averageDailySales are equal', () => {
    const parts = [
      makePart({
        id: '2',
        name: 'Zunchos',
        currentStock: 0,
        minimumStock: 10,
        averageDailySales: 2,
        leadTimeDays: 0,
        criticalityLevel: 3,
      }),
      makePart({
        id: '1',
        name: 'Amortecedor',
        currentStock: 0,
        minimumStock: 10,
        averageDailySales: 2,
        leadTimeDays: 0,
        criticalityLevel: 3,
      }),
      makePart({
        id: '3',
        name: 'Motor',
        currentStock: 0,
        minimumStock: 10,
        averageDailySales: 2,
        leadTimeDays: 0,
        criticalityLevel: 3,
      }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result.map((item) => item.name)).toEqual(['Amortecedor', 'Motor', 'Zunchos']);
  });

  it('does not reorder equal scores when only unitCost differs', () => {
    const parts = [
      makePart({
        id: 'expensive',
        name: 'Clip',
        currentStock: 0,
        minimumStock: 10,
        averageDailySales: 1,
        leadTimeDays: 0,
        criticalityLevel: 3,
        unitCost: 400,
      }),
      makePart({
        id: 'cheap',
        name: 'Bracket',
        currentStock: 0,
        minimumStock: 10,
        averageDailySales: 1,
        leadTimeDays: 0,
        criticalityLevel: 3,
        unitCost: 1,
      }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result.map((item) => item.partId)).toEqual(['cheap', 'expensive']);
    expect(result[0].moneyAtRisk).toBe(10);
    expect(result[1].moneyAtRisk).toBe(4000);
  });

  it('returns the documented Oil Filter example', () => {
    const part = makePart({
      id: 'abc-123',
      name: 'Oil Filter X',
      currentStock: 15,
      minimumStock: 20,
      averageDailySales: 4,
      leadTimeDays: 5,
      unitCost: 18.5,
      criticalityLevel: 3,
    });
    expect(calculateRestockPriorities([part])).toEqual([
      {
        partId: 'abc-123',
        name: 'Oil Filter X',
        currentStock: 15,
        projectedStock: -5,
        minimumStock: 20,
        urgencyScore: 75,
        suggestedOrderQuantity: 25,
        daysUntilStockout: 3.75,
        moneyAtRisk: 462.5,
      },
    ]);
  });

  it('does not include criticalityLevel or averageDailySales in output', () => {
    const part = makePart({
      id: '1',
      name: 'Test',
      currentStock: 0,
      minimumStock: 10,
      averageDailySales: 1,
      leadTimeDays: 1,
      criticalityLevel: 3,
    });
    const result = calculateRestockPriorities([part]);
    expect(result[0]).not.toHaveProperty('criticalityLevel');
    expect(result[0]).not.toHaveProperty('averageDailySales');
  });
});
