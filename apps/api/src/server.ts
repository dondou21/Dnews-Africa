import app from "./app";
import { config } from "./config";
import { schedulerService } from "./services/schedulerService";

const server = app.listen(config.port, () => {
  console.log(`[server] Dnews Africa API running on port ${config.port}`);
  schedulerService.start();
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
