import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinancialGoal, SavingsScenario } from '@/types/finance';

const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export function useGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setGoals([]); return; }

      const response = await fetch(`${API_BASE_URL}/goals?limit=100`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch goals');

      const data = await response.json();
      // Backend returns { data: { goals: [], pagination: {} } }
      const raw = data.data?.goals ?? [];

      const formatted: FinancialGoal[] = raw.map((g: any) => ({
        id: g._id || g.id,
        description: g.goalTitle || g.description || 'Financial Goal',
        targetAmount: g.targetAmount || 0,
        currentAmount: g.currentSavings ?? g.currentAmount ?? 0,
        deadline: g.deadline
          ? new Date(g.deadline).toISOString().split('T')[0]
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        naturalLanguageInput: g.naturalLanguageInput || g.goalTitle || '',
        parsedIntent: g.llmEnhanced?.refinedCategory || 'general savings',
        createdAt: g.createdAt || new Date().toISOString(),
      }));

      setGoals(formatted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch goals';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = useCallback(async (naturalLanguageInput: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ naturalLanguageInput }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to add goal');
      }

      const data = await response.json();
      const g = data.data;

      // Optimistically add to list
      const newGoal: FinancialGoal = {
        id: g._id || g.id,
        description: g.goalTitle || naturalLanguageInput,
        targetAmount: g.targetAmount || 0,
        currentAmount: g.currentSavings || 0,
        deadline: g.deadline
          ? new Date(g.deadline).toISOString().split('T')[0]
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        naturalLanguageInput,
        parsedIntent: g.llmEnhanced?.refinedCategory || 'general savings',
        createdAt: g.createdAt || new Date().toISOString(),
      };

      setGoals((prev) => [newGoal, ...prev]);
      return { success: true, goal: newGoal, llmEnhanced: g.llmEnhanced };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add goal';
      setError(msg);
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        await fetchGoals(); // rollback
        throw new Error('Failed to delete goal');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete goal';
      setError(msg);
    }
  }, [fetchGoals]);

  const addToGoal = useCallback(async (id: string, amount: number) => {
    try {
      // Optimistic update
      setGoals((prev) =>
        prev.map((g) => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)
      );

      const goal = goals.find((g) => g.id === id);
      const newAmount = (goal?.currentAmount || 0) + amount;

      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentAmount: newAmount }),
      });

      if (!response.ok) {
        await fetchGoals();
        throw new Error('Failed to update goal');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update goal';
      setError(msg);
    }
  }, [goals, fetchGoals]);

  // Fixed: takes only goal as argument (GoalsPage was passing 3 args — fixed below)
  const calculateScenarios = useCallback((goal: FinancialGoal): SavingsScenario[] => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const daysToDeadline = Math.max(1, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const weeksToDeadline = Math.ceil(daysToDeadline / 7);
    const monthsToDeadline = Math.max(1,
      (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth())
    );

    const scenarios: SavingsScenario[] = [
      { period: 'daily', amount: Math.ceil(remaining / daysToDeadline), projectedSavings: remaining, timeToGoal: `${daysToDeadline} days` },
      { period: 'weekly', amount: Math.ceil(remaining / weeksToDeadline), projectedSavings: remaining, timeToGoal: `${weeksToDeadline} weeks` },
      { period: 'monthly', amount: Math.ceil(remaining / monthsToDeadline), projectedSavings: remaining, timeToGoal: `${monthsToDeadline} months` },
    ];

    const yearsToDeadline = monthsToDeadline / 12;
    if (yearsToDeadline >= 1) {
      scenarios.push({ period: 'yearly', amount: Math.ceil(remaining / yearsToDeadline), projectedSavings: remaining, timeToGoal: `${Math.ceil(yearsToDeadline)} years` });
    }
    return scenarios;
  }, []);

  const totalProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  }, [goals]);

  return { goals, addGoal, deleteGoal, addToGoal, calculateScenarios, totalProgress, isLoading, error, refetch: fetchGoals };
}