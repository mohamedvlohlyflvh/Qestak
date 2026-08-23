-- Fix: Add description column to Contract table
-- Run this against your Neon database via the Neon Console SQL Editor
-- or via psql if you have it available

ALTER TABLE "Contract" ADD COLUMN IF NOT EXISTS "description" TEXT;
