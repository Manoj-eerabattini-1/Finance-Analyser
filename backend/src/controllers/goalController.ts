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
    const { naturalLanguageInput, goalTitle, targetAmount, deadline, currentSavings = 0 } = req.body;

    // Get user currency
    const user = await User.findById(req.userId);
    const currency: CurrencyType = (user?.currency as CurrencyType) || "INR";

    let finalTitle = goalTitle;
    let finalAmount = targetAmount;
    let finalDeadline = deadline;
    let llmEnhanced = null;

    // If natural language input provided, use LLM to parse it
    if (naturalLanguageInput && (!goalTitle || !targetAmount || !deadline)) {
      try {
        const interpretation = await interpretGoal(naturalLanguageInput, currency);
        finalTitle = finalTitle || interpretation.goalTitle;
        finalAmount = finalAmount || interpretation.targetAmount;

        // Convert months to a deadline date if not provided
        if (!finalDeadline) {
          const deadlineDate = new Date();
          deadlineDate.setMonth(deadlineDate.getMonth() + interpretation.estimatedDeadlineMonths);
          finalDeadline = deadlineDate.toISOString();
        }

        const suggestions = await generateFinancialSuggestions(
          50000, 30000, finalAmount, currency
        );

        llmEnhanced = {
          confidence: interpretation.confidence,
          refinedCategory: interpretation.category,
          rawInterpretation: interpretation.rawInterpretation,
          suggestions,
          estimatedDeadlineMonths: interpretation.estimatedDeadlineMonths,
        };
      } catch (llmError) {
        console.warn("LLM parsing failed, using fallback:", llmError);
        // Fallback: use input as title, set sensible defaults
        finalTitle = finalTitle || naturalLanguageInput.substring(0, 100);
        finalAmount = finalAmount || 100000;
        if (!finalDeadline) {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          finalDeadline = d.toISOString();
        }
      }
    }

    // Validate we have the minimum required fields
    if (!finalTitle || !finalAmount || !finalDeadline) {
      throw new ApiError(400, "Please provide goal details: title, target amount, and deadline");
    }

    const deadlineDate = new Date(finalDeadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new ApiError(400, "Invalid deadline date");
    }

    const goal = new Goal({
      userId: req.userId,
      goalTitle: finalTitle,
      targetAmount: finalAmount,
      deadline: deadlineDate,
      currentSavings,
    });

    await goal.save();

    sendResponse(res, 201, true, "Goal created successfully", {
      // ...goal.toObject(),
      ...(goal.toObject() as Record<string, any>),
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
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;

    const total = await Goal.countDocuments({ userId: req.userId });
    const goals = await Goal.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    sendResponse(res, 200, true, "Goals retrieved successfully", {
      goals,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
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
    if (!goal) throw new ApiError(404, "Goal not found");

    const monthsLeft = Math.ceil(
      (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    );
    const amountLeft = goal.targetAmount - goal.currentSavings;
    const monthlySavingsRequired = monthsLeft > 0 ? amountLeft / monthsLeft : 0;

    sendResponse(res, 200, true, "Goal retrieved successfully", {
      // ...goal.toObject(), 
      ...(goal.toObject() as Record<string, any>),
      monthsLeft, amountLeft, monthlySavingsRequired,
    });
  } catch (error) {
    next(error);
  }
};

// NEW — handles addToGoal from frontend (PUT /api/goals/:id)
export const updateGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentSavings, currentAmount, goalTitle, targetAmount, deadline } = req.body;

    const goal = await Goal.findOne({ _id: id, userId: req.userId });
    if (!goal) throw new ApiError(404, "Goal not found");

    // Support both field names (frontend uses currentAmount, DB uses currentSavings)
    if (currentSavings !== undefined) goal.currentSavings = currentSavings;
    if (currentAmount !== undefined) goal.currentSavings = currentAmount;
    if (goalTitle) goal.goalTitle = goalTitle;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (deadline) goal.deadline = new Date(deadline);

    await goal.save();

    sendResponse(res, 200, true, "Goal updated successfully", goal.toObject() as Record<string, any>);
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
    if (!goal) throw new ApiError(404, "Goal not found");
    await Goal.deleteOne({ _id: id });
    sendResponse(res, 200, true, "Goal deleted successfully");
  } catch (error) {
    next(error);
  }
};