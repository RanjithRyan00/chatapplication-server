const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logger = createLogger({
    transports : [
        new transports.Console({
            handleExceptions: true,
            level : 'debug',
            format : combine(
                timestamp( { format: 'YYYY-MM-DD HH:mm:ss'}),
                printf(info => `${info.message}`)
                // printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            ),
        })
    ],
    exitOnError: false
})

module.exports = logger;