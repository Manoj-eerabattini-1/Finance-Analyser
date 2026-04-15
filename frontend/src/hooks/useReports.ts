import { useState, useEffect, useCallback } from 'react';
import { FinancialReport } from '@/types/finance';

export function useReports() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();
      
      // Map MongoDB _id to frontend id
      const mappedReports = data.data.map((r: any) => ({
        ...r,
        id: r._id,
      }));
      setReports(mappedReports);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveReport = async (reportData: Omit<FinancialReport, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) throw new Error('Failed to save report');
      const data = await response.json();
      
      const newReport = {
        ...data.data,
        id: data.data._id,
      };
      
      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete report');
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    isLoading,
    error,
    saveReport,
    deleteReport,
    refetch: fetchReports,
  };
}
