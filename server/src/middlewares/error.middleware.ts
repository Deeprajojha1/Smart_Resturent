import type { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

type StatusError = Error & { statusCode?: number };

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = (err as StatusError)?.statusCode ?? 500;
  const message =
    err instanceof Error ? err.message : "Something went wrong on the server.";
  console.error("Error:", message);
  res.status(status).json({
    success: false,
    message,
  });
};
