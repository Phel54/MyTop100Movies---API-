import winston, { verbose } from 'winston';

const logConfiguration = {
    transports: [
        new winston.transports.Console({
            level: 'warn',
            format: winston.format.combine(
                winston.format.label({
                    label: `⛔ `,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (warn) =>
                        `${warn.level}: ${warn.label}: ${[warn.timestamp]}: ${
                            warn.message
                        }`
                ),        winston.format.colorize({
                    all:true
                }),
            ),
        }),
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.label({
                    label: `🔷 `,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (console) =>
                        `${console.level}: ${console.label}: ${[console.timestamp]}: ${
                            console.message
                        }`
                ),        winston.format.colorize({
                    all:true
                }),
            ),
        }),
        new winston.transports.Console({
            level: 'silly',
            format: winston.format.combine(
                winston.format.label({
                    label: `🟢 `,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (silly) =>
                        `${silly.level}: ${silly.label}: ${[silly.timestamp]}: ${
                            silly.message
                        }`
                ),        winston.format.colorize({
                    all:true
                }),
            ),
        }),
        new winston.transports.Console({
            level: 'verbose',
            format: winston.format.combine(
                winston.format.label({
                    label: `🟠 `,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (verbose) =>
                        `${verbose.level}: ${verbose.label}: ${[verbose.timestamp]}: ${
                            verbose.message
                        }`
                ),        winston.format.colorize({
                    all:true
                }),
            ),
        }),
        new winston.transports.File({
            level: 'error',
            format: winston.format.combine(
                winston.format.label({
                    label: `⛔ `,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (error) =>
                        `${error.level}: ${error.label}: ${[
                            error.timestamp,
                        ]}: ${error.message}`
                ),        winston.format.colorize({
                    all:true
                }),
            ),
            // Create the log directory if it does not exist
            filename: 'src/main/logs/log/error.log',
        }),
        new winston.transports.File({
            level: 'info',
            //Create a format
            format: winston.format.combine(
                winston.format.label({
                    label: `💡`,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (info) =>
                        `${info.level}: ${info.label}: ${[info.timestamp]}: ${
                            info.message
                        }`
                ),
                winston.format.colorize({
                    all:true
                }),
            ),
            // Create the log directory if it does not exist
            filename: 'src/main/logs/log/server.log',
        }),
        new winston.transports.File({
            level: 'debug',
            format: winston.format.combine(
                winston.format.label({
                    label: `📀`,
                }),
                winston.format.timestamp({
                    format: 'MMM-DD-YYYY HH:mm:ss',
                }),
                winston.format.printf(
                    (debug) =>
                        `${debug.level}: ${debug.label}: ${[
                            debug.timestamp,
                        ]}: ${debug.message}`
                ),        winston.format.colorize({
                    all:true
                }),
            ),
            // Create the log directory if it does not exist
            filename: 'src/main/logs/log/debug.log',
        }),
    ],
}
const logger = winston.createLogger(logConfiguration)

if (process.env.NODE_ENV !== 'production') {
    logger.debug('Logging initialized at debug level');
}


export class LoggerStream {
    write(message: string) {
        logger.info(message.substring(0, message.lastIndexOf('\n')));
    }
}


export default logger;