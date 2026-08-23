#!/usr/bin/env node
/**
 * Apply the pending Prisma migration (1_add_description) directly via PostgreSQL.
 * 
 * This script tries 3 methods in order:
 *   1. npx prisma migrate deploy
 *   2. npx prisma db execute --file <sql>
 *   3. Direct PostgreSQL connection via pg module
 * 
 * Usage from Windows cmd.exe:
 *   cd C:\Users\HP\Desktop\Programmng\Qestak
 *   node run-migration.mjs
 */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = __dirname;
const SQL_FILE = path.join(PROJECT_DIR, 'prisma', 'migrations', '1_add_description', 'migration.sql');

function header(msg) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${msg}`);
  console.log('='.repeat(60));
}

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    execSync(cmd, {
      cwd: PROJECT_DIR,
      stdio: 'inherit',
      shell: process.env.COMSPEC || 'cmd.exe',
      timeout: 30000,
    });
    return true;
  } catch {
    console.error(`  FAILED (will try next method)`);
    return false;
  }
}

// ---- Attempt 1: prisma migrate deploy ----
header('Attempt 1: prisma migrate deploy');
if (run('npx.cmd prisma migrate deploy')) {
  console.log('\n✓ SUCCESS: Migration applied via prisma migrate deploy');
  process.exit(0);
}

// ---- Attempt 2: prisma db execute ----
header('Attempt 2: prisma db execute --file');
if (run(`npx.cmd prisma db execute --file "${SQL_FILE}"`)) {
  console.log('\n✓ SUCCESS: Migration applied via prisma db execute');
  process.exit(0);
}

// ---- Attempt 3: Direct PostgreSQL ----
header('Attempt 3: Direct SQL via pg module');

async function main() {
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: path.join(PROJECT_DIR, '.env') });
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL not found in .env');

    const sql = fs.readFileSync(SQL_FILE, 'utf8').trim();
    console.log(`SQL to execute:\n  ${sql}\n`);

    const pg = await import('pg');
    const { Client } = pg;
    const client = new Client({ connectionString: databaseUrl });

    await client.connect();
    console.log('Connected to PostgreSQL. Executing SQL...');
    
    const result = await client.query(sql);
    console.log(`Query result: ${JSON.stringify(result)}`);
    console.log('\n✓ SUCCESS: Migration applied via direct SQL');
    
    await client.end();
    process.exit(0);
  } catch (e) {
    console.error(`\n✗ FAILED: ${e.message}`);
    if (e.code) console.error(`  Code: ${e.code}`);
    process.exit(1);
  }
}

main();
