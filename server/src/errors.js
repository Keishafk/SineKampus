export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export function notFound(req, res) {
  res.status(404).json({ error: { message: 'Endpoint not found.' } });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const status = error.status ?? 500;
  if (status >= 500) console.error(error);

  res.status(status).json({
    error: {
      message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
}
