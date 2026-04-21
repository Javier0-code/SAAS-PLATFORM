const morgan = require('morgan');
const logger = require('../utils/logger');

// Stream de Winston para Morgan
const morganStream = {
  write: (message) => logger.http(message.trim())
};

// Formato personalizado
const morganFormat = process.env.NODE_ENV === 'production'
  ? 'combined'
  : ':method :url :status :response-time ms - :res[content-length]';

const requestLogger = morgan(morganFormat, { stream: morganStream });

module.exports = requestLogger;
