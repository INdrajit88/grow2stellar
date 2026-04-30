export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: statusCode === 500 ? "Internal server error" : error.message,
      details: error.details,
    },
  });

  if (statusCode === 500) {
    console.error(error);
  }
}
