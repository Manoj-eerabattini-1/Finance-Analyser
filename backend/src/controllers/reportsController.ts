import { Request, Response, NextFunction } from "express";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import axios from "axios";
import {
  getCurrentMonthStats,
  getSpendingByCategory,
  calculateAverageMonthlyIncome,
  calculateAverageMonthlyExpenses,
  calculateSavingsRate,
} from "../utils/financialCalculator.js";
import Goal from "../models/Goal.js";
import Transaction from "../models/Transaction.js";
import Report from "../models/Report.js";

/**
 * Save a generated report
 * POST /api/reports
 */
export const saveReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, period, totalIncome, totalExpenses, netSavings, goalProgress, scenarios, insights } = req.body;

    const report = new Report({
      userId: req.userId,
      title,
      period,
      totalIncome,
      totalExpenses,
      netSavings,
      goalProgress,
      scenarios,
      insights,
    });

    await report.save();

    sendResponse(res, 201, true, "Report saved successfully", report);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all saved reports for a user
 * GET /api/reports
 */
export const getSavedReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
    sendResponse(res, 200, true, "Reports retrieved successfully", reports);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a saved report
 * DELETE /api/reports/:id
 */
export const deleteSavedReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const report = await Report.findOne({ _id: id, userId: req.userId });

    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    await Report.deleteOne({ _id: id });
    sendResponse(res, 200, true, "Report deleted successfully");
  } catch (error) {
    next(error);
  }
};

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

export const generateReportInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw new ApiError(401, "User authentication required");
    }

    const monthStats = await getCurrentMonthStats(req.userId);
    const avgMonthlyIncome = await calculateAverageMonthlyIncome(req.userId, 3);
    const avgMonthlyExpenses = await calculateAverageMonthlyExpenses(req.userId, 3);
    
    // Top Expense Categories
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const topExpenseCategories = await Transaction.aggregate([
      { $match: { userId: req.userId, type: "expense", date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 3 }
    ]);

    const categoriesStr = topExpenseCategories.map(c => `${c._id}: ${c.total}`).join(", ") || "None";

    const dataBlock = `
    Current Month Income: ${monthStats.income}
    Current Month Expenses: ${monthStats.expenses}
    Current Month Savings Rate: ${monthStats.savingsRate}%
    3-Month Avg Income: ${avgMonthlyIncome}
    3-Month Avg Expenses: ${avgMonthlyExpenses}
    Top Categories This Month: ${categoriesStr}
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, "AI service not configured");
    }

    const systemPrompt = `You are an expert financial advisor. Based on the following financial data, generate exactly 3-4 short, crisp, highly personalized insights/suggestions for the user.
    Do not use markdown formatting like bold text or asterisks! Just provide a JSON array of strings, where each string is a single insight.
    Example: ["Your savings rate dropped this month.", "Consider cutting back on dining out.", "Great job keeping income steady!"]
    
    Data:
    ${dataBlock}
    `;

    const contents = [{ role: "user", parts: [{ text: "Please generate my report insights." }] }];

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.5, maxOutputTokens: 512 },
      }
    ).catch(err => {
      console.error("Gemini API Error (Insights):", err.response?.data || err.message);
      if (err.response?.status === 404) {
        throw new ApiError(500, "Gemini Model Not Found (404). Please check the model name.");
      }
      throw err;
    });

    let rawReply: string = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    rawReply = rawReply.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

    let insights: string[] = [];
    try {
      insights = JSON.parse(rawReply);
    } catch {
      insights = ["Unable to generate dynamic insights at this time."];
    }

    sendResponse(res, 200, true, "Insights generated successfully", { insights });
  } catch (error) {
    next(error);
  }
};
