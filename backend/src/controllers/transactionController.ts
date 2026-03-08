import { Request, Response, NextFunction } from "express";
import Transaction from "../models/Transaction.js";
import { sendResponse, ApiError } from "../utils/apiResponse.js";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      date: date ? new Date(date) : Date.now(),
    });

    await transaction.save();

    sendResponse(res, 201, true, "Transaction created successfully", transaction);
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter: any = { userId: req.userId };

    if (type && (type === "income" || type === "expense")) {
      filter.type = type;
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    sendResponse(res, 200, true, "Transactions retrieved successfully", {
      transactions,
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

export const getTransactionSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    const incomeTransactions = await Transaction.find({
      ...filter,
      type: "income",
    });
    const expenseTransactions = await Transaction.find({
      ...filter,
      type: "expense",
    });

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: Record<string, { income: number; expense: number }> = {};

    incomeTransactions.forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { income: 0, expense: 0 };
      }
      categoryBreakdown[t.category].income += t.amount;
    });

    expenseTransactions.forEach((t) => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { income: 0, expense: 0 };
      }
      categoryBreakdown[t.category].expense += t.amount;
    });

    sendResponse(res, 200, true, "Summary retrieved successfully", {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ _id: id, userId: req.userId });

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    await Transaction.deleteOne({ _id: id });

    sendResponse(res, 200, true, "Transaction deleted successfully");
  } catch (error) {
    next(error);
  }
};
