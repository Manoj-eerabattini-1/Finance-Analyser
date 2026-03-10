import { Types } from "mongoose";
import Transaction from "../models/Transaction.js";
import Goal from "../models/Goal.js";
import { formatCurrency, CurrencyType } from "./currencyFormatter.js";

/**
 * Calculate total income for a user in a given time period
 */
export const calculateTotalIncome = async (
  userId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const transactions = await Transaction.find({
    userId,
    type: "income",
    date: { $gte: startDate, $lte: endDate },
  });

  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculate total expenses for a user in a given time period
 */
export const calculateTotalExpenses = async (
  userId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const transactions = await Transaction.find({
    userId,
    type: "expense",
    date: { $gte: startDate, $lte: endDate },
  });

  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculate average monthly income
 */
export const calculateAverageMonthlyIncome = async (
  userId: Types.ObjectId,
  monthsBack: number = 3
): Promise<number> => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const totalIncome = await calculateTotalIncome(userId, startDate, endDate);
  return Math.round(totalIncome / monthsBack);
};

/**
 * Calculate average monthly expenses
 */
export const calculateAverageMonthlyExpenses = async (
  userId: Types.ObjectId,
  monthsBack: number = 3
): Promise<number> => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const totalExpenses = await calculateTotalExpenses(userId, startDate, endDate);
  return Math.round(totalExpenses / monthsBack);
};

/**
 * Calculate required monthly savings
 */
export const calculateMonthlySavingsRequired = (
  targetAmount: number,
  currentSavings: number,
  deadline: Date
): number => {
  const today = new Date();
  const monthsLeft = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (monthsLeft <= 0) {
    return 0;
  }

  const amountLeft = targetAmount - currentSavings;
  return Math.round(amountLeft / monthsLeft);
};

/**
 * Determine if a goal is feasible based on available funds
 */
export const isGoalFeasible = (
  requiredMonthlySavings: number,
  availableAmount: number
): boolean => {
  return availableAmount >= requiredMonthlySavings;
};

/**
 * Generate goal feasibility suggestion
 */
export const generateGoalSuggestion = (
  requiredMonthlySavings: number,
  availableAmount: number,
  monthlyExpenses: number
): string => {
  const shortage = requiredMonthlySavings - availableAmount;

  if (availableAmount >= requiredMonthlySavings) {
    return "Your goal is achievable with your current income and expenses. Keep up the consistent savings!";
  }

  const reductionPercent = Math.round((shortage / monthlyExpenses) * 100);

  if (reductionPercent <= 5) {
    return `You need to reduce discretionary spending by approximately ${reductionPercent}% to meet this goal.`;
  } else if (reductionPercent <= 15) {
    return `Consider reducing discretionary spending by ${reductionPercent}% and looking for additional income sources.`;
  } else if (reductionPercent <= 30) {
    return `This goal requires significant lifestyle changes (${reductionPercent}% reduction) or finding additional income. Consider extending the deadline.`;
  } else {
    return `This goal appears very difficult with current finances. Consider increasing the timeline or breaking it into smaller goals.`;
  }
};

/**
 * Generate alternative savings scenarios with currency support
 */
export const generateAlternativeScenarios = (
  targetAmount: number,
  currentSavings: number,
  deadline: Date,
  currency: CurrencyType = 'INR'
): Array<{
  scenarioName: string;
  monthlySavings: number;
  adjustmentPercent: number;
  description: string;
}> => {
  const baseMonthsSavings = calculateMonthlySavingsRequired(
    targetAmount,
    currentSavings,
    deadline
  );

  const scenarios = [];

  // Scenario 1: Reduce deadline by 6 months
  const scenario1Date = new Date(deadline);
  scenario1Date.setMonth(scenario1Date.getMonth() - 6);
  const scenario1Savings = calculateMonthlySavingsRequired(
    targetAmount,
    currentSavings,
    scenario1Date
  );
  scenarios.push({
    scenarioName: "Accelerated Plan (6 months earlier)",
    monthlySavings: scenario1Savings,
    adjustmentPercent: Math.round(
      ((scenario1Savings - baseMonthsSavings) / baseMonthsSavings) * 100
    ),
    description: `Achieve goal 6 months earlier by saving ${formatCurrency(scenario1Savings, currency)} monthly`,
  });

  // Scenario 2: Extend deadline by 6 months
  const scenario2Date = new Date(deadline);
  scenario2Date.setMonth(scenario2Date.getMonth() + 6);
  const scenario2Savings = calculateMonthlySavingsRequired(
    targetAmount,
    currentSavings,
    scenario2Date
  );
  scenarios.push({
    scenarioName: "Extended Plan (6 months later)",
    monthlySavings: scenario2Savings,
    adjustmentPercent: Math.round(
      ((scenario2Savings - baseMonthsSavings) / baseMonthsSavings) * 100
    ),
    description: `Achieve goal with reduced monthly savings of ${formatCurrency(scenario2Savings, currency)}`,
  });

  // Scenario 3: Increase target by covering only 80%
  const scenario3Amount = targetAmount * 0.8;
  const scenario3Savings = calculateMonthlySavingsRequired(
    scenario3Amount,
    currentSavings,
    deadline
  );
  scenarios.push({
    scenarioName: "Reduced Target (80% of goal)",
    monthlySavings: scenario3Savings,
    adjustmentPercent: Math.round(
      ((scenario3Savings - baseMonthsSavings) / baseMonthsSavings) * 100
    ),
    description: `Achieve 80% of goal (${formatCurrency(Math.round(scenario3Amount), currency)}) with ${formatCurrency(scenario3Savings, currency)} monthly`,
  });

  return scenarios;
};

/**
 * Get spending breakdown by category
 */
export const getSpendingByCategory = async (
  userId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> => {
  const transactions = await Transaction.find({
    userId,
    type: "expense",
    date: { $gte: startDate, $lte: endDate },
  });

  const breakdown: Record<string, number> = {};

  transactions.forEach((transaction) => {
    const category = transaction.category;
    if (!breakdown[category]) {
      breakdown[category] = 0;
    }
    breakdown[category] += transaction.amount;
  });

  return breakdown;
};

/**
 * Calculate savings rate (savings / income * 100)
 */
export const calculateSavingsRate = (
  income: number,
  expenses: number
): number => {
  if (income === 0) return 0;
  const savings = income - expenses;
  return Math.round((savings / income) * 100);
};

/**
 * Get current month's transactions stats
 */
export const getCurrentMonthStats = async (
  userId: Types.ObjectId
): Promise<{
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}> => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const income = await calculateTotalIncome(userId, startOfMonth, endOfMonth);
  const expenses = await calculateTotalExpenses(
    userId,
    startOfMonth,
    endOfMonth
  );
  const balance = income - expenses;
  const savingsRate = calculateSavingsRate(income, expenses);

  return { income, expenses, balance, savingsRate };
};
