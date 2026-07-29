const { spawn } = require("child_process");
const { mkdirSync, existsSync } = require("fs");
const { join } = require("path");

const logDir = join(__dirname, "..", "logs");
if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const logFile = join(logDir, "dev.log");
const fs = require("fs");
const out = fs.createWriteStream(logFile, { flags: "a" });

out.write(`\n--- ${new Date().toISOString()} ---\n`);

const child = spawn("npx", ["expo", "start"], {
  stdio: ["inherit", "pipe", "pipe"],
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: process.env.NODE_OPTIONS || "--no-experimental-detect-module",
  },
});

child.stdout.on("data", (d) => {
  process.stdout.write(d);
  out.write(d);
});

child.stderr.on("data", (d) => {
  process.stderr.write(d);
  out.write(d);
});

child.on("close", (code) => {
  out.end();
  process.exit(code ?? 0);
});
