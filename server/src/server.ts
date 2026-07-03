import app from "./app";
import { config } from "./config";

const start = () => {
  try {
    app.listen(config.port, () => {
      console.log(`[server] Dnews Africa API running on port ${config.port}`);
    });
  } catch (error) {
    console.error("[server] Failed to start:", error);
    process.exit(1);
  }
};

start();
