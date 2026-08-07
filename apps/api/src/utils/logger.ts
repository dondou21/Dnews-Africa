type LogLevel = "info" | "warn" | "error";

export type LogMeta = Record<string, unknown>;

function formatErr(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { error: err.message, name: err.name, stack: err.stack };
  }
  return { error: String(err) };
}

function log(level: LogLevel, module: string, message: string, meta?: LogMeta) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, module, message, ...meta };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (module: string, message: string, meta?: LogMeta) => log("info", module, message, meta),
  warn: (module: string, message: string, meta?: LogMeta) => log("warn", module, message, meta),
  error: (module: string, message: string, meta?: LogMeta) => {
    let m: LogMeta | undefined = meta ? { ...meta } : undefined;
    if (m && "err" in m) {
      const { err, ...rest } = m;
      m = { ...formatErr(err), ...rest };
    }
    log("error", module, message, m);
  },
};
