import app from "./app";
import { config } from "./config";
import { schedulerService } from "./services/schedulerService";
import { warmUpPool } from "./utils/poolWarmup";
import { spawn } from "node:child_process";

const HOST = "0.0.0.0";

function runMigrations(): Promise<void> {
  if (!config.isProduction) return Promise.resolve();
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  return new Promise((resolve, reject) => {
    console.log("[server] Running database migrations in the background...");
    const migration = spawn(command, ["prisma", "migrate", "deploy"], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
    migration.once("error", reject);
    migration.once("exit", (code, signal) => {
      if (code === 0) {
        console.log("[server] Database migrations complete");
        resolve();
      } else {
        reject(new Error(`Database migrations failed${signal ? ` (${signal})` : ""}${code === null ? "" : ` with exit code ${code}`}`));
      }
    });
  });
}

runMigrations().catch((error) => {
  console.error("[server] Startup migrations failed:", error);
  process.exit(1);
});

console.log("[server] Starting Dnews Africa API...");
console.log(`[server] NODE_ENV=${config.nodeEnv}`);
console.log(`[server] PORT=${config.port}`);

const server = app.listen(config.port, HOST, () => {
  console.log(`[server] Listening on ${HOST}:${config.port}`);
  schedulerService.start();
  warmUpPool().then(() => console.log("[server] Database pool warmed up"));
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[server] Port ${config.port} is already in use`);
  } else {
    console.error("[server] Failed to start:", err);
  }
  process.exit(1);
});

const shutdown = () => {
  schedulerService.stop();
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
