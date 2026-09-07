const timestamp = () => new Date().toISOString();

exports.logRequest = (message) => {
  console.log(`[${timestamp()}] INFO: ${message}`);
};

exports.logError = (message) => {
  console.error(`[${timestamp()}] ERROR: ${message}`);
};

exports.logWarning = (message) => {
  console.warn(`[${timestamp()}] WARN: ${message}`);
};
