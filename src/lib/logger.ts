type LogLevel = 'info' | 'warn' | 'error';

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context) {
    entry.context = Object.fromEntries(
      Object.entries(context).map(([key, value]) => [key, serialize(value)])
    );
  }

  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) =>
    log('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    log('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    log('error', message, context),
};
