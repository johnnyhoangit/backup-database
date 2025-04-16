import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { config } from 'config';

const { dir: logDir, level, maxFiles } = config.logging;

const transport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'backup-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: `${maxFiles}d`,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
}); 