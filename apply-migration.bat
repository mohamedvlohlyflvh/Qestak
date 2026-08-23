@echo off
REM ==============================================================
REM  Apply Prisma migration to add description column to Contract
REM  Double-click this file or run from cmd.exe
REM ==============================================================
cd /d "%~dp0"
echo.
echo === Step 1: Applying prisma migrate deploy ===
call npx prisma migrate deploy
if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Migration applied!
    pause
    exit /b 0
)
echo.
echo === Step 1 failed, trying prisma db execute ===
call npx prisma db execute --file prisma/migrations/1_add_description/migration.sql
if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Migration applied via db execute!
    pause
    exit /b 0
)
echo.
echo === Direct SQL fallback via Node.js ===
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ibzkP32OwCFM@ep-dawn-bird-aqraars8-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=verify-full' });
client.connect().then(() => client.query('ALTER TABLE \"Contract\" ADD COLUMN \"description\" TEXT;')).then(() => { console.log('Column added!'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Migration applied via direct SQL!
    pause
    exit /b 0
)
echo.
echo FAILED: Could not apply migration.
echo Try running manually: npx prisma migrate deploy
pause
exit /b 1
