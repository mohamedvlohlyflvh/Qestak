import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

console.log("Running prisma generate...");
execSync("npx prisma generate", { cwd: root, stdio: "inherit", shell: true });
console.log("Done!");
