import { Request, Response, NextFunction } from "express";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import { interpretGoal, generateFinancialSuggestions } from "../services/llmService.js";
import { CurrencyType } from "../utils/currencyFormatter.js";

export const createGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { goalTitle, targetAmount, deadline, currentSavings = 0 } = req.body;

    const goal = new Goal({
      userId: req.userId,
      goalTitle,
      targetAmount,
      deadline: new Date(deadline),
      currentSavings,
    });

    await goal.save();

    // ✨ NEW: Auto-enhance with LLM using user's preferred currency
    let llmEnhanced = null;
    try {
      // Get user's currency preference (default to INR)
      const user = await User.findById(req.userId);
      const currency: CurrencyType = (user?.currency as CurrencyType) || 'INR';
      
      // Call LLM to enhance goal understanding with currency support
      const llmInterpretation = await interpretGoal(goalTitle, currency);
      
      // Generate financial suggestions with currency support
      const suggestions = await generateFinancialSuggestions(
        50000, // Assumed monthly income for suggestions
        30000, // Assumed monthly expenses for suggestions
        targetAmount,
        currency // Pass user's currency preference
      );

      llmEnhanced = {
        confidence: llmInterpretation.confidence,
        refinedCategory: llmInterpretation.category,
        rawInterpretation: llmInterpretation.rawInterpretation,
        suggestions: suggestions,
        estimatedDeadlineMonths: llmInterpretation.estimatedDeadlineMonths,
      };
    } catch (llmError) {
      // Silently fail - goal is still created without LLM
      console.warn("LLM enhancement skipped:", llmError);
    }

    const goalObj = goal.toObject();
    sendResponse(res, 201, true, "Goal created successfully", {
      ...goalObj,
      llmEnhanced,
    });
  } catch (error) {
    next(error);
  }
};

export const getGoals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const total = await Goal.countDocuments({ userId: req.userId });
    const goals = await Goal.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    sendResponse(res, 200, true, "Goals retrieved successfully", {
      goals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId: req.userId });

    if (!goal) {
      throw new ApiError(404, "Goal not found");
    }

    const monthsLeft = Math.ceil(
      (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    );
    const amountLeft = goal.targetAmount - goal.currentSavings;
    const monthlySavingsRequired = monthsLeft > 0 ? amountLeft / monthsLeft : 0;

    const goalObj = goal.toObject();
    sendResponse(res, 200, true, "Goal retrieved successfully", {
      ...goalObj,
      monthsLeft,
      amountLeft,
      monthlySavingsRequired,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId: req.userId });

    if (!goal) {
      throw new ApiError(404, "Goal not found");
    }

    await Goal.deleteOne({ _id: id });

    sendResponse(res, 200, true, "Goal deleted successfully");
  } catch (error) {
    next(error);
  }
};
