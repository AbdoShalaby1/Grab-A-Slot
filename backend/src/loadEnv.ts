import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const root = process.cwd();
const envFile = resolve(root, ".env");
const exampleFile = resolve(root, ".env.example");

if (existsSync(envFile)) {
  config({ path: envFile });
} else if (existsSync(exampleFile)) {
  config({ path: exampleFile });
}
