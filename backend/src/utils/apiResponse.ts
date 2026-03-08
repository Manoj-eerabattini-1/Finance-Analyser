import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  errors?: any[]
): Response => {
  const response: ApiResponse<T> = {
    success,
    message,
  };

  if (data) {
    response.data = data;
  }

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors: any[] = []
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
