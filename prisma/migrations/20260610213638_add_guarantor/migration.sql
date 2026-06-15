-- CreateTable
CREATE TABLE "Guarantor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "contractId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guarantor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guarantor_contractId_key" ON "Guarantor"("contractId");

-- CreateIndex
CREATE INDEX "Guarantor_nationalId_idx" ON "Guarantor"("nationalId");

-- AddForeignKey
ALTER TABLE "Guarantor" ADD CONSTRAINT "Guarantor_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
