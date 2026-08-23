/**
 * Apply the missing description column migration directly.
 * This script connects to the PostgreSQL database and runs the ALTER TABLE.
 */
import { execSync } from 'child_process';

try {
  console.log('Applying migration: ALTER TABLE "Contract" ADD COLUMN "description" TEXT;');
  execSync('npx prisma migrate deploy', { 
    cwd: process.cwd(), 
    stdio: 'inherit',
    shell: process.platform === 'win32' ? true : '/bin/bash'
  });
  console.log('Migration applied successfully!');
  process.exit(0);
} catch (err) {
  console.error('npx prisma migrate deploy failed:', err.message);
  console.log('Trying fallback: direct SQL execution...');
  
  try {
    // Try using prisma db execute to run the SQL
    execSync('npx prisma db execute --file prisma/migrations/1_add_description/migration.sql', {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: process.platform === 'win32' ? true : '/bin/bash'
    });
    console.log('Migration applied successfully via db execute!');
    process.exit(0);
  } catch (err2) {
    console.error('Direct SQL execution also failed:', err2.message);
    process.exit(1);
  }
}
