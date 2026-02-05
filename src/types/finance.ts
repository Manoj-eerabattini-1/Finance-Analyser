export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  naturalLanguageInput: string;
  parsedIntent?: string;
  createdAt: string;
}

export interface SavingsScenario {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number;
  projectedSavings: number;
  timeToGoal: string;
}

export interface FinancialReport {
  id: string;
  title: string;
  period: { start: string; end: string };
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  goalProgress: number;
  scenarios: SavingsScenario[];
  insights: string[];
  createdAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
  topExpenseCategories: { category: string; amount: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}
