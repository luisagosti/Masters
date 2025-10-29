const logger = (req, res, next) => {
  if (process.env.ENVIRONMENT !== "production") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
};
module.exports = logger;