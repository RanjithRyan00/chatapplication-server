const logger = require('../logger/logger');

const logRequest = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration} ms - ${res.get('Content-Length') || 0}`;
    logger.info(logMessage);
  });

  next();
};

module.exports = logRequest;
