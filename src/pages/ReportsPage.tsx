import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { FinancialReport } from '@/types/finance';
import { FileText, Download, Trash2, Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function ReportsPage() {
  const { summary, transactions } = useTransactions();
  const { goals, totalProgress } = useGoals();
  const [reports, setReports] = useLocalStorage<FinancialReport[]>('finance-planner-reports', []);

  const generateReport = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const insights: string[] = [];
    
    // Generate insights
    if (summary.savingsRate > 20) {
      insights.push('Great job! Your savings rate is above 20%, which is excellent.');
    } else if (summary.savingsRate > 0) {
      insights.push(`Your savings rate is ${summary.savingsRate.toFixed(1)}%. Try to aim for at least 20%.`);
    } else {
      insights.push('Your expenses exceed your income. Review your spending habits.');
    }

    if (summary.topExpenseCategories.length > 0) {
      const topCategory = summary.topExpenseCategories[0];
      insights.push(`Your biggest expense category is ${topCategory.category} at ${formatCurrency(topCategory.amount)}.`);
    }

    if (goals.length > 0) {
      insights.push(`You have ${goals.length} active goal(s) with ${totalProgress.toFixed(1)}% overall progress.`);
    }

    const report: FinancialReport = {
      id: crypto.randomUUID(),
      title: `Financial Report - ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      period: {
        start: startOfMonth.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      },
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netSavings: summary.netBalance,
      goalProgress: totalProgress,
      scenarios: [],
      insights,
      createdAt: now.toISOString(),
    };

    setReports(prev => [report, ...prev]);
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
            <p className="text-muted-foreground">
              Generate and review your financial summaries.
            </p>
          </div>
          <Button onClick={generateReport} className="gradient-primary">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {/* Current Summary Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Financial Summary</CardTitle>
            <CardDescription>Based on all recorded transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="font-semibold">{formatCurrency(summary.totalIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="font-semibold">{formatCurrency(summary.totalExpenses)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Balance</p>
                  <p className="font-semibold">{formatCurrency(summary.netBalance)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="font-semibold">{transactions.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Reports */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Saved Reports</h2>
          
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first financial report to track your progress.
                </p>
                <Button onClick={generateReport}>Generate Report</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>
                          {new Date(report.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Income</p>
                        <p className="font-medium text-success">{formatCurrency(report.totalIncome)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expenses</p>
                        <p className="font-medium text-destructive">{formatCurrency(report.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Savings</p>
                        <p className="font-medium">{formatCurrency(report.netSavings)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goal Progress</p>
                        <p className="font-medium">{report.goalProgress.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    {report.insights.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Insights</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {report.insights.map((insight, i) => (
                            <li key={i}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
