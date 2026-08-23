import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

try {
  console.log("🔄 Generating Prisma client...");
  execSync('npx.cmd prisma generate', { cwd: root, stdio: "inherit", shell: "cmd.exe" });
  console.log("✅ Prisma client generated!");
} catch {
  console.log("⚠️ Generate failed, trying alternative...");
  // Just try without .cmd extension
  try {
    execSync('npx prisma generate', { cwd: root, stdio: "inherit", shell: "cmd.exe" });
  } catch (e2) {
    console.error("❌ Failed:", e2.message);
  }
}
