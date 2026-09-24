export interface PartInput {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  averageDailySales: number;
  leadTimeDays: number;
  unitCost: number;
  criticalityLevel: number;
}

export interface PriorityResult {
  partId: string;
  name: string;
  currentStock: number;
  projectedStock: number;
  minimumStock: number;
  urgencyScore: number;
  suggestedOrderQuantity: number;
  daysUntilStockout: number | null;
  moneyAtRisk: number;
}

interface PriorityIntermediate extends PriorityResult {
  criticalityLevel: number;
  averageDailySales: number;
}

export function calculateRestockPriorities(parts: PartInput[]): PriorityResult[] {
  return parts
    .map((part): PriorityIntermediate => {
      const expectedConsumption = part.averageDailySales * part.leadTimeDays;
      const projectedStock = part.currentStock - expectedConsumption;
      const gap = part.minimumStock - projectedStock;
      return {
        partId: part.id,
        name: part.name,
        currentStock: part.currentStock,
        projectedStock,
        minimumStock: part.minimumStock,
        urgencyScore: gap * part.criticalityLevel,
        suggestedOrderQuantity: Math.ceil(gap),
        daysUntilStockout:
          part.averageDailySales > 0 ? part.currentStock / part.averageDailySales : null,
        moneyAtRisk: gap * part.unitCost,
        criticalityLevel: part.criticalityLevel,
        averageDailySales: part.averageDailySales,
      };
    })
    .filter((item) => item.projectedStock < item.minimumStock)
    .sort((left, right) => {
      if (right.urgencyScore !== left.urgencyScore) {
        return right.urgencyScore - left.urgencyScore;
      }
      if (right.criticalityLevel !== left.criticalityLevel) {
        return right.criticalityLevel - left.criticalityLevel;
      }
      if (right.averageDailySales !== left.averageDailySales) {
        return right.averageDailySales - left.averageDailySales;
      }
      return left.name.localeCompare(right.name);
    })
    .map((item) => ({
      partId: item.partId,
      name: item.name,
      currentStock: item.currentStock,
      projectedStock: item.projectedStock,
      minimumStock: item.minimumStock,
      urgencyScore: item.urgencyScore,
      suggestedOrderQuantity: item.suggestedOrderQuantity,
      daysUntilStockout: item.daysUntilStockout,
      moneyAtRisk: item.moneyAtRisk,
    }));
}
