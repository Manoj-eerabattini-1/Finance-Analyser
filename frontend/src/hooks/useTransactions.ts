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
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [summaryData, setSummaryData] = useState<FinancialSummary | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/summary`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  }, []);

  const fetchTransactions = useCallback(async (pageNum = 1, limitNum = 10) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setTransactions([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/transactions?page=${pageNum}&limit=${limitNum}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data = await response.json();
      const raw = data.data?.transactions ?? [];
      const pagin = data.data?.pagination;

      const formatted: Transaction[] = raw.map((t: any) => ({
        id: t._id || t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description || '',
        date: t.date
          ? new Date(t.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        createdAt: t.createdAt || new Date().toISOString(),
      }));

      setTransactions(formatted);
      if (pagin) setPagination(pagin);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(1, 10);
    fetchSummary();
  }, [fetchTransactions, fetchSummary]);

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
              ? new Date(transaction.date).toISOString()
              : new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to add transaction');
        }

        await fetchTransactions(pagination.page, pagination.limit);
        await fetchSummary();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add transaction';
        console.error(msg);
        setError(msg);
        throw err;
      }
    },
    [fetchTransactions, fetchSummary, pagination.page, pagination.limit]
  );

  const addMultipleTransactions = useCallback(
    async (txns: Omit<Transaction, 'id' | 'createdAt'>[]) => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/transactions/batch`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ transactions: txns }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to add transactions');
        }

        await fetchTransactions(pagination.page, pagination.limit);
        await fetchSummary();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add transactions';
        console.error(msg);
        setError(msg);
        throw err;
      }
    },
    [fetchTransactions, fetchSummary, pagination.page, pagination.limit]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      await fetchTransactions(pagination.page, pagination.limit);
      await fetchSummary();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete transaction';
      console.error(msg);
      setError(msg);
    }
  }, [fetchTransactions, fetchSummary, pagination.page, pagination.limit]);

  return {
    transactions,
    addTransaction,
    addMultipleTransactions,
    deleteTransaction,
    summary: summaryData || { 
      totalIncome: 0, totalExpenses: 0, netBalance: 0, 
      avgMonthlyIncome: 0, avgMonthlyExpenses: 0, avgMonthlySavings: 0,
      savingsRate: 0, topExpenseCategories: [], monthlyTrend: [] 
    },
    pagination,
    isLoading,
    error,
    refetch: () => { fetchTransactions(pagination.page, pagination.limit); fetchSummary(); },
    setPage: (page: number) => fetchTransactions(page, pagination.limit),
  };
}