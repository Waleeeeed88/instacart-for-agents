import type { ErrorRequestHandler } from 'express';
import { messageFromError, statusFromError } from '../utils/http-error.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = statusFromError(error);
  res.status(status).json({ error: messageFromError(error), status });
};
