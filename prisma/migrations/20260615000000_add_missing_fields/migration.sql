-- Add missing columns to Contract
ALTER TABLE "Contract" ADD COLUMN "interestRate" DOUBLE PRECISION;
ALTER TABLE "Contract" ADD COLUMN "installmentInterval" INTEGER DEFAULT 30;
