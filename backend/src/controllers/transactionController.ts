import { Request, Response, NextFunction } from "express";
import Transaction from "../models/Transaction.js";
import { sendResponse, ApiError } from "../utils/apiResponse.js";
import axios from "axios";

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
      .sort({ date: -1, createdAt: -1 })
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
    const allTransactions = await Transaction.find({ userId: req.userId });

    const totalIncome = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

    // Monthly trend - last 6 months
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const monthLabel = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const monthTxns = allTransactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === d.getFullYear() &&
          tDate.getMonth() === d.getMonth()
        );
      });

      return {
        month: monthLabel,
        income: monthTxns
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTxns
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
      };
    }).reverse();

    const avgMonthlyIncome =
      monthlyTrend.reduce((sum, m) => sum + m.income, 0) / 6;
    const avgMonthlyExpenses =
      monthlyTrend.reduce((sum, m) => sum + m.expenses, 0) / 6;
    const avgMonthlySavings = avgMonthlyIncome - avgMonthlyExpenses;

    // Top expense categories
    const categoryTotals = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    sendResponse(res, 200, true, "Summary retrieved successfully", {
      totalIncome,
      totalExpenses,
      netBalance,
      avgMonthlyIncome,
      avgMonthlyExpenses,
      avgMonthlySavings,
      savingsRate,
      topExpenseCategories,
      monthlyTrend,
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

export const extractTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attachedFile } = req.body;
    if (!attachedFile || !attachedFile.data || !attachedFile.mimeType) {
      throw new ApiError(400, "Attached file is required");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, "AI service not configured");
    }

    const systemPrompt = `You are a financial data extraction tool. Determine all the valid transactions (income or expenses) present in the provided receipt or image document. 
Strictly output a JSON block in the exact format:
ACTION:{"type":"add_multiple_transactions","transactions":[{"transactionType":"expense","amount":number,"category":"string","description":"string","date":"YYYY-MM-DD"}]}

If the date is missing on the receipt, use the current date ${new Date().toISOString().split('T')[0]}.
Only include ONE action block. Do not provide any conversational text, just the raw ACTION block.`;

    const contents = [
      {
        role: "user",
        parts: [
          { text: "Extract transactions from this receipt." },
          { inlineData: { mimeType: attachedFile.mimeType, data: attachedFile.data } }
        ],
      }
    ];

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }
    ).catch(err => {
      console.error("Gemini API Error Detail:", err.response?.data || err.message);
      if (err.response?.status === 404) {
        throw new ApiError(500, "Gemini Model Not Found (404). Please check the model name.");
      }
      if (err.response?.status === 429) {
        throw new ApiError(500, "Gemini API Quota Exceeded (429). Please try again later.");
      }
      throw err;
    });

    const rawReply: string = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const actionIndex = rawReply.lastIndexOf("ACTION:");
    if (actionIndex === -1) {
      throw new ApiError(500, "Failed to extract transactions structure");
    }

    let actionJsonStr = rawReply.substring(actionIndex + 7).trim();
    actionJsonStr = actionJsonStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    const action = JSON.parse(actionJsonStr);

    if (action.type !== "add_multiple_transactions" || !Array.isArray(action.transactions)) {
      throw new ApiError(500, "Invalid extraction format returned");
    }

    const transactionsToSave = action.transactions.map((t: any) => ({
      userId: req.userId,
      type: t.transactionType,
      amount: t.amount,
      category: t.category || "Other",
      description: t.description || "Extracted from receipt",
      date: t.date ? new Date(t.date) : new Date(),
    }));

    await Transaction.insertMany(transactionsToSave);

    sendResponse(res, 201, true, "Transactions extracted successfully", { count: transactionsToSave.length });
  } catch (error) {
    next(error);
  }
};
export const createMultipleTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      throw new ApiError(400, "Transactions must be an array");
    }

    const transactionsToSave = transactions.map((t) => ({
      userId: req.userId,
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description || "",
      date: t.date ? new Date(t.date) : new Date(),
    }));

    const saved = await Transaction.insertMany(transactionsToSave);

    sendResponse(res, 201, true, `${saved.length} transactions created successfully`, saved);
  } catch (error) {
    next(error);
  }
};
