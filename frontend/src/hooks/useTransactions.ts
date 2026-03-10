import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, FinancialSummary } from '@/types/finance';

const API_BASE_URL = 'http://localhost:5000/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from backend
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('No token found. User not authenticated.');
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched transactions:', data);
      
      // Convert date strings to proper format for the frontend
      const formattedTransactions = (data.data?.transactions || []).map((t: any) => ({
        ...t,
        id: t._id || t.id,
        date: t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: t.createdAt || new Date().toISOString(),
      }));

      setTransactions(formattedTransactions);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error('Error fetching transactions:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transaction,
          date: transaction.date || new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add transaction');
      }

      const data = await response.json();
      console.log('Transaction added:', data);
      
      // Refresh transactions list
      await fetchTransactions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add transaction';
      console.error('Error adding transaction:', errorMsg);
      setError(errorMsg);
    }
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      console.log('Transaction deleted:', id);
      
      // Refresh transactions list
      await fetchTransactions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete transaction';
      console.error('Error deleting transaction:', errorMsg);
      setError(errorMsg);
    }
  }, [fetchTransactions]);

  const summary = useMemo((): FinancialSummary => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Calculate top expense categories
    const categoryTotals = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Calculate monthly trend (last 6 months)
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthTransactions = transactions.filter(
        (t) => t.date.startsWith(monthStr)
      );
      
      return {
        month: monthName,
        income: monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      };
    }).reverse();

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      savingsRate,
      topExpenseCategories,
      monthlyTrend,
    };
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    summary,
    isLoading,
    error,
  };
}
