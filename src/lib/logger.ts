type LogFields = Record<string, unknown>;

function sanitize(fields?: LogFields): LogFields | undefined {
  if (!fields) {
    return undefined;
  }
  const blocked = ["apiKey", "authorization", "password", "passwordHash", "token", "secret"];
  const next: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (blocked.some((item) => key.toLowerCase().includes(item.toLowerCase()))) {
      next[key] = "[redacted]";
    } else {
      next[key] = value;
    }
  }
  return next;
}

function write(level: string, message: string, fields?: LogFields) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...sanitize(fields),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info(message: string, fields?: LogFields) {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields) {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields) {
    write("error", message, fields);
  },
};
