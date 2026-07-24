import app from "./app";
import { config } from "./config";

const server = app.listen(config.port, () => {
  console.log(`[server] Dnews Africa API running on port ${config.port}`);
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
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
