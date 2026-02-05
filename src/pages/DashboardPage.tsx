import { StatsCards } from '@/components/dashboard/StatsCards';
import { TransactionForm } from '@/components/dashboard/TransactionForm';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { IncomeExpenseChart, CategoryChart, TrendChart } from '@/components/dashboard/FinanceCharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { useTransactions } from '@/hooks/useTransactions';

export function DashboardPage() {
  const { transactions, addTransaction, deleteTransaction, summary } = useTransactions();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your income, expenses, and financial health.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsCards
          totalIncome={summary.totalIncome}
          totalExpenses={summary.totalExpenses}
          netBalance={summary.netBalance}
          savingsRate={summary.savingsRate}
        />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <IncomeExpenseChart monthlyTrend={summary.monthlyTrend} />
          <CategoryChart categories={summary.topExpenseCategories} />
        </div>

        {/* Trend Chart */}
        <TrendChart monthlyTrend={summary.monthlyTrend} />

        {/* Transactions */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <TransactionForm onSubmit={addTransaction} />
          </div>
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
