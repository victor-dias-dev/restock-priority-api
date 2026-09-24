# restock-priority

Pure function that ranks parts for replenishment. It does not import NestJS, Prisma, or a database driver.

```ts
import { calculateRestockPriorities, PartInput } from 'restock-priority';

const parts: PartInput[] = [
  {
    id: 'uuid',
    name: 'Oil Filter X',
    currentStock: 15,
    minimumStock: 20,
    averageDailySales: 4,
    leadTimeDays: 5,
    unitCost: 18.5,
    criticalityLevel: 3,
  },
];

calculateRestockPriorities(parts);
```

## Formulas

- Expected consumption = `averageDailySales * leadTimeDays`
- Projected stock = `currentStock - expectedConsumption`
- A part needs replenishment when `projectedStock < minimumStock`
- Urgency score = `(minimumStock - projectedStock) * criticalityLevel`
- Suggested order quantity = `ceil(minimumStock - projectedStock)`
- Days until stockout = `currentStock / averageDailySales`, or `null` when daily sales are 0
- Money at risk = `(minimumStock - projectedStock) * unitCost`

Sort order is urgency score descending. Ties break by higher criticality, then higher average daily sales, then name ascending.

## Worked example

Stock 15, minimum 20, daily sales 4, lead time 5 days, unit cost 18.50, criticality 3.

| Field | Value |
|---|---|
| Expected consumption | 20 |
| Projected stock | -5 |
| Urgency score | 75 |
| Suggested order quantity | 25 |
| Days until stockout | 3.75 |
| Money at risk | 462.5 |

## Trade-off

Criticality controls the queue. A cheap brake pad outranks an expensive trim piece when the pad is more critical or will miss its minimum by more, weighted by that criticality. `moneyAtRisk` is there so a buyer can override the rank. Changing unit cost never changes the order by itself.

## License

MIT © Victor Dias. The license text is the repository [LICENSE](../../LICENSE).
