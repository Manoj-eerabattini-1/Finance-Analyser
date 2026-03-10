import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import { isValidCurrency, CurrencyType } from "../utils/currencyFormatter.js";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, currency = 'INR' } = req.body;

    // Validate currency if provided
    if (currency && !isValidCurrency(currency)) {
      throw new ApiError(400, "Invalid currency. Supported: INR, USD");
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      throw new ApiError(409, "Email already registered");
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      currency: currency || 'INR',
    });

    await user.save();

    const token = generateToken(user._id);

    sendResponse(
      res,
      201,
      true,
      "User registered successfully",
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        token,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user._id);

    sendResponse(res, 200, true, "Login successful", {
      userId: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency || 'INR',
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    sendResponse(res, 200, true, "Profile retrieved successfully", {
      userId: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency || 'INR',
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's currency preference
 * @route GET /api/auth/currency
 */
export const getCurrency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    sendResponse(res, 200, true, "Currency preference retrieved", {
      currency: user.currency || 'INR',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set user's currency preference
 * @route PUT /api/auth/currency
 * @body { currency: 'INR' | 'USD' }
 */
export const setCurrency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currency } = req.body;

    // Validate currency
    if (!currency || !isValidCurrency(currency)) {
      throw new ApiError(400, "Invalid currency. Supported: INR, USD");
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { currency},
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    sendResponse(res, 200, true, "Currency preference updated successfully", {
      currency: user.currency,
    });
  } catch (error) {
    next(error);
  }
};
