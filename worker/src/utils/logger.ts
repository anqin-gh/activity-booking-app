import { createLogger, transports, format } from 'winston';

const logger = createLogger({
   transports: [new transports.File({ filename: 'logfile.log' })],
   exceptionHandlers: [new transports.File({ filename: 'exceptions.log' })],
});

if (process.env.NODE_ENV !== 'production') {
   logger.add(
      new transports.Console({
         format: format.simple(),
      })
   );
}

export default logger;
