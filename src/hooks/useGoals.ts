import { useLocalStorage } from './useLocalStorage';
import { FinancialGoal, SavingsScenario } from '@/types/finance';
import { useCallback, useMemo } from 'react';

const GOALS_KEY = 'finance-planner-goals';

// Simple NLP parsing for financial goals (mock implementation)
function parseGoalFromText(text: string): Partial<FinancialGoal> {
  const lowerText = text.toLowerCase();
  
  // Extract amount patterns like "$5000", "5000 dollars", "5k"
  const amountPatterns = [
    /\$?([\d,]+(?:\.\d{2})?)\s*(?:dollars?|usd)?/i,
    /\$?([\d]+)k\b/i,
  ];
  
  let targetAmount = 0;
  for (const pattern of amountPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ''));
      if (pattern.source.includes('k\\b')) {
        amount *= 1000;
      }
      targetAmount = amount;
      break;
    }
  }

  // Extract deadline patterns
  const deadlinePatterns = [
    { pattern: /by\s+(?:end\s+of\s+)?(\w+)\s+(\d{4})/i, type: 'month-year' },
    { pattern: /in\s+(\d+)\s+(month|year|week)s?/i, type: 'relative' },
    { pattern: /within\s+(\d+)\s+(month|year|week)s?/i, type: 'relative' },
  ];

  let deadline = new Date();
  deadline.setFullYear(deadline.getFullYear() + 1); // Default: 1 year from now

  for (const { pattern, type } of deadlinePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      if (type === 'month-year') {
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
        const monthIndex = monthNames.findIndex(m => m.startsWith(match[1].toLowerCase()));
        if (monthIndex !== -1) {
          deadline = new Date(parseInt(match[2]), monthIndex + 1, 0);
        }
      } else if (type === 'relative') {
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit.startsWith('month')) {
          deadline.setMonth(deadline.getMonth() + amount);
        } else if (unit.startsWith('year')) {
          deadline.setFullYear(deadline.getFullYear() + amount);
        } else if (unit.startsWith('week')) {
          deadline.setDate(deadline.getDate() + amount * 7);
        }
      }
      break;
    }
  }

  // Determine intent
  let parsedIntent = 'general savings';
  const intents = [
    { keywords: ['emergency', 'rainy day', 'safety'], intent: 'emergency fund' },
    { keywords: ['vacation', 'trip', 'travel', 'holiday'], intent: 'vacation savings' },
    { keywords: ['house', 'home', 'down payment', 'property'], intent: 'home purchase' },
    { keywords: ['car', 'vehicle', 'auto'], intent: 'vehicle purchase' },
    { keywords: ['retire', 'retirement'], intent: 'retirement savings' },
    { keywords: ['wedding', 'marriage'], intent: 'wedding fund' },
    { keywords: ['education', 'college', 'university', 'school'], intent: 'education fund' },
    { keywords: ['debt', 'loan', 'pay off', 'credit'], intent: 'debt repayment' },
  ];

  for (const { keywords, intent } of intents) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      parsedIntent = intent;
      break;
    }
  }

  return {
    targetAmount,
    deadline: deadline.toISOString().split('T')[0],
    parsedIntent,
    description: parsedIntent.charAt(0).toUpperCase() + parsedIntent.slice(1),
  };
}

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<FinancialGoal[]>(GOALS_KEY, []);

  const addGoal = useCallback((naturalLanguageInput: string) => {
    const parsed = parseGoalFromText(naturalLanguageInput);
    
    const newGoal: FinancialGoal = {
      id: crypto.randomUUID(),
      description: parsed.description || 'Financial Goal',
      targetAmount: parsed.targetAmount || 1000,
      currentAmount: 0,
      deadline: parsed.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      naturalLanguageInput,
      parsedIntent: parsed.parsedIntent,
      createdAt: new Date().toISOString(),
    };
    
    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  }, [setGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  }, [setGoals]);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, [setGoals]);

  const addToGoal = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );
  }, [setGoals]);

  const calculateScenarios = useCallback((goal: FinancialGoal, monthlyIncome: number, monthlyExpenses: number): SavingsScenario[] => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const availableSavings = monthlyIncome - monthlyExpenses;
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const monthsToDeadline = Math.max(1, 
      (deadlineDate.getFullYear() - now.getFullYear()) * 12 + 
      (deadlineDate.getMonth() - now.getMonth())
    );

    const scenarios: SavingsScenario[] = [];

    // Daily scenario
    const daysToDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAmount = remaining / daysToDeadline;
    scenarios.push({
      period: 'daily',
      amount: Math.ceil(dailyAmount * 100) / 100,
      projectedSavings: remaining,
      timeToGoal: `${daysToDeadline} days`,
    });

    // Weekly scenario
    const weeksToDeadline = Math.ceil(daysToDeadline / 7);
    const weeklyAmount = remaining / weeksToDeadline;
    scenarios.push({
      period: 'weekly',
      amount: Math.ceil(weeklyAmount * 100) / 100,
      projectedSavings: remaining,
      timeToGoal: `${weeksToDeadline} weeks`,
    });

    // Monthly scenario
    const monthlyAmount = remaining / monthsToDeadline;
    scenarios.push({
      period: 'monthly',
      amount: Math.ceil(monthlyAmount * 100) / 100,
      projectedSavings: remaining,
      timeToGoal: `${monthsToDeadline} months`,
    });

    // Yearly scenario (if applicable)
    const yearsToDeadline = monthsToDeadline / 12;
    if (yearsToDeadline >= 1) {
      const yearlyAmount = remaining / yearsToDeadline;
      scenarios.push({
        period: 'yearly',
        amount: Math.ceil(yearlyAmount * 100) / 100,
        projectedSavings: remaining,
        timeToGoal: `${Math.ceil(yearsToDeadline)} years`,
      });
    }

    return scenarios;
  }, []);

  const totalProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  }, [goals]);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    calculateScenarios,
    totalProgress,
  };
}
