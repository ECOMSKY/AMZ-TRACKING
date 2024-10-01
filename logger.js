const winston = require("winston");
const expressWinston = require("express-winston");
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
// Configure transports (console and file)
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logsDir, "app.log") }),
];

// Create a logger with the configured transports
const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: transports,
});

// Middleware for logging API requests
const apiLoggerMiddleware = expressWinston.logger({
    transports: transports,
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.json(),
    ),
    meta: false, // Log additional metadata (such as query parameters)
    msg: "HTTP {{req.method}} {{req.url}} - Body: {{JSON.stringify(req.body)}}",
    expressFormat: true,
    colorize: false,
});

module.exports = {
    logger: logger,
    apiLoggerMiddleware: apiLoggerMiddleware,
};
