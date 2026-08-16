import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

/**
 * LogContext interface for tracing transactions across the distributed architecture.
 * Supports domains: government, finance, supply-chain, real-estate, automotive, security, system.
 */
export interface LogContext {
  correlationId?: string;
  userId?: string;
  serverId?: string;
  domain?: 'government' | 'finance' | 'supply-chain' | 'real-estate' | 'automotive' | 'security' | 'system';
  [key: string]: any;
}

export const logContextStorage = new AsyncLocalStorage<LogContext>();

const levels = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const colors = {
  emergency: 'red bold underline',
  alert: 'red yellowBG bold',
  critical: 'red bold',
  error: 'red',
  warning: 'yellow',
  notice: 'blue',
  info: 'green',
  debug: 'magenta',
};

winston.addColors(colors);

const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const contextFormat = winston.format((info) => {
  const context = logContextStorage.getStore();
  return context ? { ...context, ...info } : info;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, correlationId, domain, ...meta }) => {
    const contextStr = [
      correlationId ? `[CID: ${correlationId}]` : '',
      domain ? `[Domain: ${domain}]` : '',
    ].filter(Boolean).join(' ');

    const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}] ${contextStr}: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.json()
);

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format: winston.format.combine(
    contextFormat(),
    winston.format.errors({ stack: true }),
    fileFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'combined.log'),
      maxsize: 52428800,
      maxFiles: 30,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
      maxsize: 52428800,
      maxFiles: 30,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, 'audit.log'),
      level: 'notice',
      maxsize: 104857600,
      maxFiles: 100,
      tailable: true,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({ format: consoleFormat }));
}

export const logger = {
  emergency: (msg: string, meta?: object) => winstonLogger.log('emergency', msg, meta),
  alert: (msg: string, meta?: object) => winstonLogger.log('alert', msg, meta),
  critical: (msg: string, meta?: object) => winstonLogger.log('critical', msg, meta),
  error: (msg: string, error?: Error | unknown, meta?: object) => {
    const errMeta = error instanceof Error ? { error: { message: error.message, stack: error.stack } } : { error };
    winstonLogger.error(msg, { ...errMeta, ...meta });
  },
  warn: (msg: string, meta?: object) => winstonLogger.warning(msg, meta),
  notice: (msg: string, meta?: object) => winstonLogger.log('notice', msg, meta),
  info: (msg: string, meta?: object) => winstonLogger.info(msg, meta),
  debug: (msg: string, meta?: object) => winstonLogger.debug(msg, meta),

  audit: (action: string, status: 'SUCCESS' | 'FAILED' | 'PENDING', details: Record<string, any>) => {
    winstonLogger.log('notice', `AUDIT_TRAIL: [${status}] - ${action}`, {
      audit: true,
      action,
      status,
      ...details,
    });
  },

  runWithContext: <T>(context: LogContext, fn: () => T): T => {
    const currentContext = logContextStorage.getStore() || {};
    return logContextStorage.run({ ...currentContext, ...context }, fn);
  },

  generateCorrelationId: (): string => randomUUID(),
};

export default logger;