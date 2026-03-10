import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinancialGoal, SavingsScenario } from '@/types/finance';

const API_BASE_URL = 'http://localhost:5000/api';

export function useGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals from backend
  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('No token found. User not authenticated.');
        setGoals([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch goals: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched goals:', data);
      
      // Format goals from backend
      const formattedGoals = (data.data || []).map((g: any) => ({
        id: g._id || g.id,
        description: g.description || g.goalTitle || 'Financial Goal',
        targetAmount: g.targetAmount || 0,
        currentAmount: g.currentAmount || g.currentSavings || 0,
        deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        naturalLanguageInput: g.naturalLanguageInput || g.description || '',
        parsedIntent: g.parsedIntent || 'general savings',
        createdAt: g.createdAt || new Date().toISOString(),
      }));

      setGoals(formattedGoals);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch goals';
      console.error('Error fetching goals:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(async (naturalLanguageInput: string) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: naturalLanguageInput,
          naturalLanguageInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add goal');
      }

      const data = await response.json();
      console.log('Goal added:', data);
      
      // Refresh goals list
      await fetchGoals();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add goal';
      console.error('Error adding goal:', errorMsg);
      setError(errorMsg);
    }
  }, [fetchGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      console.log('Goal deleted:', id);
      
      // Update local state immediately for better UX
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete goal';
      console.error('Error deleting goal:', errorMsg);
      setError(errorMsg);
    }
  }, []);

  const addToGoal = useCallback(async (id: string, amount: number) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        return;
      }

      // Update locally first for better UX
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g
        )
      );

      // Then sync with backend
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentAmount: goal.currentAmount + amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal');
      }

      console.log('Goal updated:', id);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update goal';
      console.error('Error updating goal:', errorMsg);
      setError(errorMsg);
      // Refresh to get correct data
      fetchGoals();
    }
  }, [goals, fetchGoals]);

  const calculateScenarios = useCallback((goal: FinancialGoal): SavingsScenario[] => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const deadlineDate = new Date(goal.deadline);
    const now = new Date();
    const monthsToDeadline = Math.max(1, 
      (deadlineDate.getFullYear() - now.getFullYear()) * 12 + 
      (deadlineDate.getMonth() - now.getMonth())
    );

    const scenarios: SavingsScenario[] = [];

    // Daily scenario
    const daysToDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dailyAmount = remaining / Math.max(1, daysToDeadline);
    scenarios.push({
      period: 'daily',
      amount: Math.ceil(dailyAmount * 100) / 100,
      projectedSavings: remaining,
      timeToGoal: `${daysToDeadline} days`,
    });

    // Weekly scenario
    const weeksToDeadline = Math.ceil(daysToDeadline / 7);
    const weeklyAmount = remaining / Math.max(1, weeksToDeadline);
    scenarios.push({
      period: 'weekly',
      amount: Math.ceil(weeklyAmount * 100) / 100,
      projectedSavings: remaining,
      timeToGoal: `${weeksToDeadline} weeks`,
    });

    // Monthly scenario
    const monthlyAmount = remaining / Math.max(1, monthsToDeadline);
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
    deleteGoal,
    addToGoal,
    calculateScenarios,
    totalProgress,
    isLoading,
    error,
  };
}
