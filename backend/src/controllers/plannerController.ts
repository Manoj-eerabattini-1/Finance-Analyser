import { Request, Response, NextFunction } from "express";
import Goal from "../models/Goal.js";
import Plan from "../models/Plan.js";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import {
  calculateAverageMonthlyIncome,
  calculateAverageMonthlyExpenses,
  calculateMonthlySavingsRequired,
  isGoalFeasible,
  generateGoalSuggestion,
  generateAlternativeScenarios,
} from "../utils/financialCalculator.js";

/**
 * Generate a savings plan for a specific goal
 * POST /api/planner/generate-plan
 */
export const generateSavingsPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { goalId } = req.body;

    // Validate goal exists
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) {
      throw new ApiError(404, "Goal not found");
    }

    // Validate goal has required fields
    if (!goal.deadline) {
      throw new ApiError(400, "Goal deadline is required to generate plan");
    }

    // Validate user ID exists (from authMiddleware)
    if (!req.userId) {
      throw new ApiError(401, "User authentication required");
    }

    // Calculate average monthly income and expenses
    const monthlyIncome = await calculateAverageMonthlyIncome(req.userId, 3);
    const monthlyExpenses = await calculateAverageMonthlyExpenses(
      req.userId,
      3
    );
    const availableAmount = monthlyIncome - monthlyExpenses;

    // Calculate required monthly savings (deadline is now guaranteed to exist)
    const requiredMonthlySavings = calculateMonthlySavingsRequired(
      goal.targetAmount,
      goal.currentSavings,
      goal.deadline // ✅ Now TypeScript knows this is not undefined
    );

    // Determine feasibility
    const feasible = isGoalFeasible(requiredMonthlySavings, availableAmount);

    // Generate suggestion
    const suggestion = generateGoalSuggestion(
      requiredMonthlySavings,
      availableAmount,
      monthlyExpenses
    );

    // Generate alternative scenarios
    const alternativeScenarios = generateAlternativeScenarios(
      goal.targetAmount,
      goal.currentSavings,
      goal.deadline
    );

    // Create and save the plan
    const plan = new Plan({
      userId: req.userId,
      goalId: goal._id,
      requiredMonthlySavings,
      feasible,
      currentMonthlyIncome: monthlyIncome,
      currentMonthlyExpenses: monthlyExpenses,
      availableAmount,
      suggestion,
      alternativeScenarios,
    });

    await plan.save();

    sendResponse(res, 201, true, "Savings plan generated successfully", {
      planId: plan._id,
      goalTitle: goal.goalTitle,
      requiredMonthlySavings,
      feasible,
      currentMonthlyIncome: monthlyIncome,
      currentMonthlyExpenses: monthlyExpenses,
      availableAmount,
      suggestion,
      alternativeScenarios,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific plan
 * GET /api/planner/plans/:planId
 */
export const getPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findOne({ _id: planId, userId: req.userId })
      .populate("goalId")
      .populate("userId", "name email");

    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    sendResponse(res, 200, true, "Plan retrieved successfully", plan);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all plans for a user
 * GET /api/planner/plans
 */
export const getAllPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const total = await Plan.countDocuments({ userId: req.userId });
    const plans = await Plan.find({ userId: req.userId })
      .populate("goalId")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    sendResponse(res, 200, true, "Plans retrieved successfully", {
      plans,
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

/**
 * Delete a plan
 * DELETE /api/planner/plans/:planId
 */
export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findOne({ _id: planId, userId: req.userId });

    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    await Plan.deleteOne({ _id: planId });

    sendResponse(res, 200, true, "Plan deleted successfully");
  } catch (error) {
    next(error);
  }
};
