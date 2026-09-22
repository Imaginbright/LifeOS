import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bootstrap = path.join(root, "scripts", "test-runtime.cjs");
const cli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
const existingOptions = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ` : "";
const child = spawn(process.execPath, [cli, "--test", "tests/*.test.ts"], {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: `${existingOptions}--conditions=react-server --require=${JSON.stringify(bootstrap)}` },
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});

