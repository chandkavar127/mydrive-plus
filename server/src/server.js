const app = require('./app');
const http = require('http');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
  process.exit(1);
});

server.listen(PORT, () => {
  logger.info(`🚀 API listening on port ${PORT}`);
});
