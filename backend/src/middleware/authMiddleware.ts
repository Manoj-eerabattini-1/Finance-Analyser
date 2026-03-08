import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import { ApiError, sendResponse } from "../utils/apiResponse.js";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    sendResponse(res, 401, false, "Access token is required");
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    sendResponse(res, 401, false, "Invalid or expired token");
    return;
  }

  req.userId = new Types.ObjectId(decoded.userId);
  next();
};
