import { Request, Response, NextFunction } from "express";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import {
  getCurrentMonthStats,
  getSpendingByCategory,
  calculateAverageMonthlyIncome,
  calculateAverageMonthlyExpenses,
  calculateSavingsRate,
} from "../utils/financialCalculator.js";
import Goal from "../models/Goal.js";
import Transaction from "../models/Transaction.js";

/**
 * Get monthly financial report (income, expenses, savings)
 * GET /api/reports/monthly
 */
export const getMonthlyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { month, year } = req.query;

    // Default to current month
    const now = new Date();
    const targetMonth = month ? parseInt(month as string) : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    // Validate month
    if (targetMonth < 0 || targetMonth > 11) {
      throw new ApiError(400, "Month must be between 0 and 11");
    }

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Validate user ID exists
    if (!req.userId) {
      throw new ApiError(401, "User authentication required");
    }

    // Get transactions for the month
    const transactions = await Transaction.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savingsRate = calculateSavingsRate(income, expenses);

    sendResponse(res, 200, true, "Monthly report retrieved successfully", {
      month: targetMonth + 1,
      year: targetYear,
      income,
      expenses,
      balance,
      savingsRate,
      transactionCount: transactions.length,
      startDate,
      endDate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get spending breakdown by category
 * GET /api/reports/spending-categories
 */
export const getSpendingCategoriesReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { month, year } = req.query;

    // Validate user ID exists
    if (!req.userId) {
      throw new ApiError(401, "User authentication required");
    }

    // Default to current month
    const now = new Date();
    const targetMonth = month ? parseInt(month as string) : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get spending by category
    const spending = await getSpendingByCategory(
      req.userId,
      startDate,
      endDate
    );

    // Get total expenses
    const expenses = await Transaction.find({
      userId: req.userId,
      type: "expense",
      date: { $gte: startDate, $lte: endDate },
    }).then((txns) => txns.reduce((sum, t) => sum + t.amount, 0));

    // Calculate percentages
    const categoryBreakdown = Object.entries(spending).map(([category, amount]) => ({
      category,
      amount,
      percentage:
        expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
    }));

    // Sort by amount descending
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    sendResponse(
      res,
      200,
      true,
      "Spending categories report retrieved successfully",
      {
        month: targetMonth + 1,
        year: targetYear,
        totalExpenses: expenses,
        categoryBreakdown,
        topCategory: categoryBreakdown[0] || null,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get savings progress towards all goals
 * GET /api/reports/savings-progress
 */
export const getSavingsProgressReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user ID exists
    if (!req.userId) {
      throw new ApiError(401, "User authentication required");
    }

    // Get all goals
    const goals = await Goal.find({ userId: req.userId });

    if (goals.length === 0) {
      sendResponse(res, 200, true, "No goals found", {
        totalGoals: 0,
        totalTargetAmount: 0,
        totalCurrentSavings: 0,
        overallProgress: 0,
        goals: [],
      });
    }

    // Calculate progress for each goal
    const goalsProgress = goals.map((goal) => {
      const targetAmount = goal.targetAmount;
      const currentSavings = goal.currentSavings;
      const progress = Math.round((currentSavings / targetAmount) * 100);
      const amountLeft = targetAmount - currentSavings;
      const deadline = goal.deadline;
      const daysLeft = Math.max(
        0,
        Math.ceil(
          (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      );

      return {
        goalId: goal._id,
        goalTitle: goal.goalTitle,
        targetAmount,
        currentSavings,
        amountLeft,
        progress,
        deadline,
        daysLeft,
        onTrack: daysLeft > 0,
      };
    });

    // Calculate overall progress
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentSavings = goals.reduce(
      (sum, g) => sum + g.currentSavings,
      0
    );
    const overallProgress =
      totalTargetAmount > 0
        ? Math.round((totalCurrentSavings / totalTargetAmount) * 100)
        : 0;

    sendResponse(res, 200, true, "Savings progress report retrieved successfully", {
      totalGoals: goals.length,
      totalTargetAmount,
      totalCurrentSavings,
      overallProgress,
      goals: goalsProgress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get financial summary (all key metrics)
 * GET /api/reports/summary
 */
export const getFinancialSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate user ID exists
    if (!req.userId) {
      throw new ApiError(401, "User authentication required");
    }

    // Current month stats
    const monthStats = await getCurrentMonthStats(req.userId);

    // Average over last 3 months
    const avgMonthlyIncome = await calculateAverageMonthlyIncome(
      req.userId,
      3
    );
    const avgMonthlyExpenses = await calculateAverageMonthlyExpenses(
      req.userId,
      3
    );

    // Goals progress
    const goals = await Goal.find({ userId: req.userId });
    const totalSavingsGoal = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSavedTowardsGoals = goals.reduce(
      (sum, g) => sum + g.currentSavings,
      0
    );

    // Spending by category (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const topExpenseCategories = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    sendResponse(res, 200, true, "Financial summary retrieved successfully", {
      currentMonth: {
        income: monthStats.income,
        expenses: monthStats.expenses,
        balance: monthStats.balance,
        savingsRate: monthStats.savingsRate,
      },
      threeMonthAverage: {
        monthlyIncome: avgMonthlyIncome,
        monthlyExpenses: avgMonthlyExpenses,
        monthlySavings: avgMonthlyIncome - avgMonthlyExpenses,
      },
      goals: {
        totalGoals: goals.length,
        totalSavingsGoal,
        totalSavedTowardsGoals,
        progressPercentage:
          totalSavingsGoal > 0
            ? Math.round((totalSavedTowardsGoals / totalSavingsGoal) * 100)
            : 0,
      },
      topExpenseCategories: topExpenseCategories.map((item: any) => ({
        category: item._id,
        amount: item.total,
      })),
    });
  } catch (error) {
    next(error);
  }
};
