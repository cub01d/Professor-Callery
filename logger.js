const { createLogger } = require('bunyan');
const logger = createLogger({
	name: 'Callery',
	stream: process.stdout,
	level: 'info',
});

module.exports = logger;
