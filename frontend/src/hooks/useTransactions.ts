import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, FinancialSummary } from '@/types/finance';

const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setTransactions([]);
        return;
      }

      // Fetch all transactions (increase limit so dashboard shows everything)
      const response = await fetch(`${API_BASE_URL}/transactions?limit=100`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();

      // Backend returns: { success, data: { transactions: [], pagination: {} } }
      const raw = data.data?.transactions ?? [];

      const formatted: Transaction[] = raw.map((t: any) => ({
        id: t._id || t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description || '',
        // Normalize date to YYYY-MM-DD always
        date: t.date
          ? new Date(t.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        createdAt: t.createdAt || new Date().toISOString(),
      }));

      setTransactions(formatted);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description || '',
            date: transaction.date
              ? new Date(transaction.date).toISOString()  // Convert to full ISO for backend
              : new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to add transaction');
        }

        const data = await response.json();
        const saved = data.data;

        // Optimistic update — add to top of list immediately
        const newTransaction: Transaction = {
          id: saved._id || saved.id,
          type: saved.type,
          amount: saved.amount,
          category: saved.category,
          description: saved.description || '',
          date: new Date(saved.date).toISOString().split('T')[0],
          createdAt: saved.createdAt || new Date().toISOString(),
        };

        setTransactions((prev) => [newTransaction, ...prev]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add transaction';
        console.error(msg);
        setError(msg);
        throw err; // Re-throw so TransactionForm knows it failed
      }
    },
    []
  );

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);

      // Optimistic remove
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Rollback by re-fetching if delete failed
        await fetchTransactions();
        throw new Error('Failed to delete transaction');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete transaction';
      console.error(msg);
      setError(msg);
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
    const savingsRate =
      totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Top expense categories
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

    // Monthly trend — last 6 months
    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      // Use YYYY-MM format to match normalized transaction dates
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthTxns = transactions.filter((t) => t.date.startsWith(monthStr));

      return {
        month: monthName,
        income: monthTxns
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTxns
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      };
    }).reverse();

    return { totalIncome, totalExpenses, netBalance, savingsRate, topExpenseCategories, monthlyTrend };
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    summary,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}