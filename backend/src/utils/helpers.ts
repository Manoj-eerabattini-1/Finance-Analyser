import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiResponse.js";

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validates if a date string is valid and in the future
 */
export const isValidFutureDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return date > new Date();
  } catch {
    return false;
  }
};

/**
 * Calculates months between two dates
 */
export const getMonthsBetween = (startDate: Date, endDate: Date): number => {
  return Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
};

/**
 * Calculates monthly savings required for a goal
 */
export const calculateMonthlySavingsRequired = (
  targetAmount: number,
  currentSavings: number,
  deadline: Date
): number => {
  const monthsLeft = getMonthsBetween(new Date(), deadline);
  const amountLeft = targetAmount - currentSavings;

  if (monthsLeft <= 0) {
    throw new ApiError(400, "Deadline must be in the future");
  }

  return amountLeft / monthsLeft;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Generates a random string for temporary tokens
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
