import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = __dirname;

/**
 * Run a prisma command via npx — works cross-platform (Windows, macOS, Linux)
 * without relying on .cmd shims or bash.
 */
function runPrisma(args) {
  const cmd = `npx prisma ${args}`;
  console.log(`Running: ${cmd}`);
  try {
    const result = execSync(cmd, {
      cwd,
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: 'pipe',
      // Let Node pick the default system shell (cmd.exe on Windows)
      shell: true,
    });
    console.log(result.toString());
  } catch (err) {
    console.error(err.stderr ? err.stderr.toString() : err.message);
    process.exit(1);
  }
}

runPrisma('migrate deploy');
runPrisma('generate');

console.log('Done!');
