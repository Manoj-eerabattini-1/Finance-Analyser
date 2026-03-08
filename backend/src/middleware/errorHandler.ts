import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError, sendResponse } from "../utils/apiResponse.js";

export const errorHandler = (
  err: Error | ApiError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", err);

  if (err instanceof ZodError) {
    const errors = err.errors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
    }));
    sendResponse(res, 400, false, "Validation error", undefined, errors);
    return;
  }

  if (err instanceof ApiError) {
    sendResponse(res, err.statusCode, false, err.message, undefined, err.errors);
    return;
  }

  sendResponse(res, 500, false, "Internal server error");
};
