const { logError } = require('./logger');

exports.errorHandler = (err, req, res, next) => {
  logError(err.message);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};
