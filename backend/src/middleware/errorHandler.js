export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  // Always log the full error server-side
  console.error(`[${statusCode}] ${req.method} ${req.path}:`, error.message);

  res.status(statusCode).json({
    error: {
      // Expose real message everywhere for this testnet MVP
      // so errors are debuggable in production logs
      message: error.message || "Internal server error",
      details: error.details,
    },
  });
}
