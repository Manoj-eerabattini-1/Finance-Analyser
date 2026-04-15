import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { useReports } from '@/hooks/useReports';
import { FinancialReport } from '@/types/finance';
import { FileText, Download, Trash2, Calendar, TrendingUp, TrendingDown, Target, Loader2, Wallet } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export function ReportsPage() {
  const { summary } = useTransactions();
  const { totalProgress } = useGoals();
  const { reports, saveReport, deleteReport, isLoading: isFetchingReports } = useReports();
  const [isGenerating, setIsGenerating] = useState(false);
  const { formatCurrency } = useCurrency();

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let insights: string[] = [];
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/insights', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        insights = data.data.insights || [];
      } else {
        insights = ["Oops, failed to generate deep insights right now. Please try again!"];
      }

      await saveReport({
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
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate/save report: " + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report: FinancialReport) => {
    const content = `
${report.title}
Generated on: ${new Date(report.createdAt).toLocaleString()}
Period: ${report.period.start} to ${report.period.end}

FINANCIAL SUMMARY:
Total Income: ${formatCurrency(report.totalIncome)}
Total Expenses: ${formatCurrency(report.totalExpenses)}
Net Savings: ${formatCurrency(report.netSavings)}
Goal Progress: ${report.goalProgress.toFixed(1)}%

INSIGHTS:
${report.insights.map(i => `• ${i}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Button onClick={generateReport} disabled={isGenerating} className="gradient-primary">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            {isGenerating ? "Analyzing Patterns..." : "Generate Insights"}
          </Button>
        </div>

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
                  <p className="text-sm text-muted-foreground">Avg Monthly Income</p>
                  <p className="font-semibold">{formatCurrency(summary.avgMonthlyIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Monthly Expenses</p>
                  <p className="font-semibold">{formatCurrency(summary.avgMonthlyExpenses)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="font-semibold">{formatCurrency(summary.netBalance)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2">
                  <Calendar className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{summary.netBalance >= 0 ? "Positive" : "Negative"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Saved Reports</h2>
          
          {isFetchingReports ? (
            <div className="py-12 text-center text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first financial report to track your progress.
                </p>
                <Button onClick={generateReport} disabled={isGenerating}>
                  {isGenerating ? "Analyzing..." : "Generate Insights"}
                </Button>
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
