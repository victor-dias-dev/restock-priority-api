-- CreateTable
CREATE TABLE "Part" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "minimumStock" INTEGER NOT NULL,
    "averageDailySales" DOUBLE PRECISION NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "criticalityLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Part_category_idx" ON "Part"("category");
