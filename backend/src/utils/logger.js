const winston = require('winston');
const path = require('path');

const { combine, timestamp, errors, json, colorize, printf, align } = winston.format;

// Formato para consola en desarrollo
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Formato para archivos en producción
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  defaultMeta: { service: 'saas-platform' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// En producción, también escribir a archivos
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: fileFormat
  }));
  logger.add(new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileFormat
  }));
}

module.exports = logger;
