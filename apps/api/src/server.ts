import app from "./app";
import { config } from "./config";
import { schedulerService } from "./services/schedulerService";
import { warmUpPool } from "./utils/poolWarmup";

const HOST = "0.0.0.0";

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
