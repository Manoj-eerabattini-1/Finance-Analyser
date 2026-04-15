import { useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TransactionForm } from '@/components/dashboard/TransactionForm';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { IncomeExpenseChart, CategoryChart, TrendChart } from '@/components/dashboard/FinanceCharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';

export function DashboardPage() {
  const { 
    transactions, 
    addTransaction, 
    addMultipleTransactions, 
    deleteTransaction, 
    summary, 
    pagination,
    setPage,
    isLoading, 
    error, 
    refetch 
  } = useTransactions();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  }, [error]);

  const handleAddTransactions = async (txns: Parameters<typeof addMultipleTransactions>[0]) => {
    try {
      if (txns.length === 1) {
        await addTransaction(txns[0]);
      } else {
        await addMultipleTransactions(txns);
      }
      toast({ title: 'Success ✓', description: `${txns.length} transaction(s) added successfully` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add transaction(s)', variant: 'destructive' });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Track your income, expenses, and financial health.</p>
        </div>

        <StatsCards
          currentBalance={summary.netBalance}
          avgMonthlyIncome={summary.avgMonthlyIncome}
          avgMonthlyExpenses={summary.avgMonthlyExpenses}
          avgMonthlySavings={summary.avgMonthlySavings}
          savingsRate={summary.savingsRate}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeExpenseChart monthlyTrend={summary.monthlyTrend} />
          <CategoryChart categories={summary.topExpenseCategories} />
        </div>

        <TrendChart monthlyTrend={summary.monthlyTrend} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TransactionForm 
              onSubmit={handleAddTransactions} 
              onExtractSuccess={() => {
                refetch();
                toast({ title: 'Success ✓', description: 'Extracted and added transactions from file' });
              }}
            />
          </div>
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}