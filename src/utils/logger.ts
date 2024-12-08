// src/utils/logger.ts

import { createLogger, transports, format } from "winston";

const logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // Include stack traces
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "firebase-functions" },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // You can add more transports here, such as File transports
  ],
});

export default logger;
