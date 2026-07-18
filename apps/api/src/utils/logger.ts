type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, module, message, ...meta };
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (module: string, message: string, meta?: Record<string, unknown>) => log("info", module, message, meta),
  warn: (module: string, message: string, meta?: Record<string, unknown>) => log("warn", module, message, meta),
  error: (module: string, message: string, meta?: Record<string, unknown>) => log("error", module, message, meta),
};
