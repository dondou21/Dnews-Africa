#!/usr/bin/env node
/**
 * Frees development ports before the monorepo dev servers start.
 *
 * Usage:
 *   node scripts/free-ports.mjs            # frees defaults: 5000 5001
 *   node scripts/free-ports.mjs 5000 5001  # frees specific ports
 *
 * Only terminates processes that are actively LISTENING on the requested
 * ports. Unrelated processes are never touched.
 */

import { execFileSync } from "node:child_process";

const DEFAULT_PORTS = [5000, 5001];

function parsePorts(argv) {
  const numeric = argv
    .map((arg) => Number.parseInt(arg, 10))
    .filter((n) => Number.isInteger(n) && n > 0 && n <= 65535);
  return numeric.length > 0 ? [...new Set(numeric)] : DEFAULT_PORTS;
}

function isWindows() {
  return process.platform === "win32";
}

/**
 * Returns the list of PIDs listening on the given port.
 */
function pidsListeningOn(port) {
  if (isWindows()) {
    const out = execFileSync("netstat", ["-ano", "-p", "tcp"], {
      encoding: "utf8",
    });
    const pids = new Set();
    const pattern = new RegExp(`\\bTCP\\b\\s+\\S*:${port}\\s+\\S+\\s+LISTENING\\s+(\\d+)`, "i");
    for (const line of out.split(/\r?\n/)) {
      const match = line.match(pattern);
      if (match) pids.add(match[1]);
    }
    return [...pids];
  }

  try {
    const out = execFileSync(
      "lsof",
      ["-nP", "-iTCP", "-sTCP:LISTEN"],
      { encoding: "utf8" }
    );
    const pids = new Set();
    const pattern = new RegExp(`^\\S+\\s+(\\d+)\\s+.*:${port}\\s+`);
    for (const line of out.split(/\r?\n/)) {
      const match = line.match(pattern);
      if (match) pids.add(match[1]);
    }
    return [...pids];
  } catch {
    return [];
  }
}

/**
 * Terminates the process with the given PID.
 */
function killProcess(pid) {
  if (isWindows()) {
    execFileSync("taskkill", ["/PID", pid, "/T", "/F"], {
      stdio: "pipe",
    });
  } else {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch {
      process.kill(Number(pid), "SIGKILL");
    }
  }
}

function freePort(port) {
  const pids = pidsListeningOn(port);
  if (pids.length === 0) {
    console.log(`[free-ports] Port ${port} is free.`);
    return;
  }
  for (const pid of pids) {
    try {
      killProcess(pid);
      console.log(`[free-ports] Terminated PID ${pid} listening on port ${port}.`);
    } catch (err) {
      console.error(
        `[free-ports] Warning: could not terminate PID ${pid} for port ${port}: ${err.message}`
      );
    }
  }
  if (pidsListeningOn(port).length === 0) {
    console.log(`[free-ports] Port ${port} freed.`);
  } else {
    console.error(`[free-ports] Port ${port} is still in use.`);
  }
}

function main() {
  const ports = parsePorts(process.argv.slice(2));
  console.log(`[free-ports] Checking ports: ${ports.join(", ")}`);
  for (const port of ports) {
    freePort(port);
  }
}

main();
