import morgan from 'morgan';

export const requestLogger = morgan('combined');

export const apiLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
}; 