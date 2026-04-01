import { Part } from '../../parts/domain/part-entity';

export interface PriorityResult {
  partId: string;
  name: string;
  currentStock: number;
  projectedStock: number;
  minimumStock: number;
  urgencyScore: number;
}

interface PriorityIntermediate extends PriorityResult {
  criticalityLevel: number;
  averageDailySales: number;
}

export function calculateRestockPriorities(parts: Part[]): PriorityResult[] {
  return parts
    .map((part): PriorityIntermediate => {
      const expectedConsumption = part.averageDailySales * part.leadTimeDays;
      const projectedStock = part.currentStock - expectedConsumption;
      const urgencyScore = (part.minimumStock - projectedStock) * part.criticalityLevel;
      return {
        partId: part.id,
        name: part.name,
        currentStock: part.currentStock,
        projectedStock,
        minimumStock: part.minimumStock,
        urgencyScore,
        criticalityLevel: part.criticalityLevel,
        averageDailySales: part.averageDailySales,
      };
    })
    .filter((item) => item.projectedStock < item.minimumStock)
    .sort((a, b) => {
      if (b.urgencyScore !== a.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      if (b.criticalityLevel !== a.criticalityLevel) {
        return b.criticalityLevel - a.criticalityLevel;
      }
      if (b.averageDailySales !== a.averageDailySales) {
        return b.averageDailySales - a.averageDailySales;
      }
      return a.name.localeCompare(b.name);
    })
    .map(({ criticalityLevel: _c, averageDailySales: _a, ...result }) => result);
}
