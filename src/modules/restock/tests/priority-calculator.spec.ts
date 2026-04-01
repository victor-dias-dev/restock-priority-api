import { calculateRestockPriorities } from '../domain/priority-calculator';
import { Part } from '../../parts/domain/part-entity';

function makePart(overrides: Partial<Part> & { id: string; name: string }): Part {
  return {
    category: 'engine',
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
    const part = makePart({ id: '1', name: 'Filtro de Óleo', currentStock: 10, minimumStock: 20, averageDailySales: 2, leadTimeDays: 3 });
    const result = calculateRestockPriorities([part]);
    expect(result).toHaveLength(1);
    expect(result[0].partId).toBe('1');
    expect(result[0].projectedStock).toBe(4);
    expect(result[0].urgencyScore).toBe((20 - 4) * 3);
  });

  it('excludes part with sufficient stock (projectedStock >= minimumStock)', () => {
    const part = makePart({ id: '1', name: 'Amortecedor', currentStock: 100, minimumStock: 5, averageDailySales: 1, leadTimeDays: 2 });
    expect(calculateRestockPriorities([part])).toEqual([]);
  });

  it('returns empty array when all parts are above threshold', () => {
    const parts = [
      makePart({ id: '1', name: 'A', currentStock: 50, minimumStock: 5, averageDailySales: 1, leadTimeDays: 1 }),
      makePart({ id: '2', name: 'B', currentStock: 80, minimumStock: 10, averageDailySales: 2, leadTimeDays: 2 }),
    ];
    expect(calculateRestockPriorities(parts)).toEqual([]);
  });

  it('handles negative projectedStock correctly', () => {
    const part = makePart({ id: '1', name: 'Pastilha de Freio', currentStock: 5, minimumStock: 20, averageDailySales: 4, leadTimeDays: 5 });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(-15);
    expect(result[0].urgencyScore).toBe(105);
  });

  it('handles zero averageDailySales (projectedStock equals currentStock)', () => {
    const part = makePart({ id: '1', name: 'Vela de Ignição', currentStock: 5, minimumStock: 10, averageDailySales: 0, leadTimeDays: 7 });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(5);
    expect(result[0].urgencyScore).toBe((10 - 5) * 3);
  });

  it('handles leadTimeDays = 0 (no consumption)', () => {
    const part = makePart({ id: '1', name: 'Correia Dentada', currentStock: 3, minimumStock: 10, averageDailySales: 5, leadTimeDays: 0 });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(3);
  });

  it('handles currentStock = 0', () => {
    const part = makePart({ id: '1', name: 'Radiador', currentStock: 0, minimumStock: 5, averageDailySales: 1, leadTimeDays: 3 });
    const result = calculateRestockPriorities([part]);
    expect(result[0].projectedStock).toBe(-3);
    expect(result[0].urgencyScore).toBe((5 - (-3)) * 3);
  });

  it('sorts by urgencyScore descending', () => {
    const parts = [
      makePart({ id: '1', name: 'A', currentStock: 5, minimumStock: 10, averageDailySales: 1, leadTimeDays: 1, criticalityLevel: 1 }),
      makePart({ id: '2', name: 'B', currentStock: 2, minimumStock: 10, averageDailySales: 1, leadTimeDays: 1, criticalityLevel: 5 }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result[0].partId).toBe('2');
    expect(result[1].partId).toBe('1');
  });

  it('tiebreaker 1: higher criticalityLevel wins when urgencyScore is equal', () => {
    const parts = [
      makePart({ id: 'low', name: 'Amortecedor', currentStock: 10, minimumStock: 22, averageDailySales: 2, leadTimeDays: 1, criticalityLevel: 3 }),
      makePart({ id: 'high', name: 'Filtro de Ar', currentStock: 0, minimumStock: 0, averageDailySales: 0, leadTimeDays: 0, criticalityLevel: 5 }),
    ];
    const partsEqual = [
      makePart({ id: 'low-crit', name: 'Buzina', currentStock: 2, minimumStock: 14, averageDailySales: 2, leadTimeDays: 1, criticalityLevel: 3 }),
      makePart({ id: 'high-crit', name: 'Alternador', currentStock: 5, minimumStock: 19, averageDailySales: 3, leadTimeDays: 1, criticalityLevel: 3 }),
    ];
    const tieparts = [
      makePart({ id: 'A', name: 'Zz Part', currentStock: 0, minimumStock: 20, averageDailySales: 0, leadTimeDays: 0, criticalityLevel: 2 }),
      makePart({ id: 'B', name: 'Aa Part', currentStock: 0, minimumStock: 8, averageDailySales: 0, leadTimeDays: 0, criticalityLevel: 5 }),
    ];
    const result = calculateRestockPriorities(tieparts);
    expect(result[0].partId).toBe('B');
    expect(result[1].partId).toBe('A');
  });

  it('tiebreaker 2: higher averageDailySales wins when urgencyScore and criticalityLevel are equal', () => {
    const parts = [
      makePart({ id: 'low-sales', name: 'Parafuso', currentStock: 0, minimumStock: 15, averageDailySales: 1, leadTimeDays: 0, criticalityLevel: 3 }),
      makePart({ id: 'high-sales', name: 'Porca', currentStock: 0, minimumStock: 15, averageDailySales: 5, leadTimeDays: 0, criticalityLevel: 3 }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result[0].partId).toBe('high-sales');
    expect(result[1].partId).toBe('low-sales');
  });

  it('tiebreaker 3: alphabetical order when urgencyScore, criticalityLevel and averageDailySales are equal', () => {
    const parts = [
      makePart({ id: '2', name: 'Zunchos', currentStock: 0, minimumStock: 10, averageDailySales: 2, leadTimeDays: 0, criticalityLevel: 3 }),
      makePart({ id: '1', name: 'Amortecedor', currentStock: 0, minimumStock: 10, averageDailySales: 2, leadTimeDays: 0, criticalityLevel: 3 }),
      makePart({ id: '3', name: 'Motor', currentStock: 0, minimumStock: 10, averageDailySales: 2, leadTimeDays: 0, criticalityLevel: 3 }),
    ];
    const result = calculateRestockPriorities(parts);
    expect(result.map((r) => r.name)).toEqual(['Amortecedor', 'Motor', 'Zunchos']);
  });

  it('returns correct shape of PriorityResult', () => {
    const part = makePart({ id: 'abc-123', name: 'Filtro de Óleo X', currentStock: 15, minimumStock: 20, averageDailySales: 4, leadTimeDays: 5, criticalityLevel: 3 });
    const result = calculateRestockPriorities([part]);
    expect(result[0]).toEqual({
      partId: 'abc-123',
      name: 'Filtro de Óleo X',
      currentStock: 15,
      projectedStock: -5,
      minimumStock: 20,
      urgencyScore: 75,
    });
  });

  it('does not include criticalityLevel or averageDailySales in output', () => {
    const part = makePart({ id: '1', name: 'Test', currentStock: 0, minimumStock: 10, averageDailySales: 1, leadTimeDays: 1, criticalityLevel: 3 });
    const result = calculateRestockPriorities([part]);
    expect(result[0]).not.toHaveProperty('criticalityLevel');
    expect(result[0]).not.toHaveProperty('averageDailySales');
  });
});
