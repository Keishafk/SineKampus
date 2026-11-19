// An Error with an HTTP status and optional details that routes can throw.
export class HttpError extends Error {
  constructor(status, message, details) {
    // `super` initializes JavaScript's built-in Error message and stack trace.
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Express does not automatically catch rejected promises in every setup.
// This wrapper forwards async route failures to the central error handler.
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// This middleware runs only when no route above it matched the request URL.
export function notFound(req, res) {
  res.status(404).json({ error: { message: 'Endpoint not found.' } });
}

// All route and middleware errors finish here, giving clients one consistent
// JSON error shape regardless of where a failure originated.
export function errorHandler(error, req, res, next) {
  // If a response already started, Express must finish handling the error.
  if (res.headersSent) return next(error);

  // Unexpected errors usually have no custom status and therefore become 500.
  const status = error.status ?? 500;

  // Log server failures for developers but avoid logging ordinary client errors.
  if (status >= 500) console.error(error);

  res.status(status).json({
    error: {
      // Hide internal error details from users when the server itself fails.
      message: status >= 500 ? 'An unexpected server error occurred.' : error.message,
      // Only add `details` when validation or another error supplied them.
      ...(error.details ? { details: error.details } : {}),
    },
  });
}
