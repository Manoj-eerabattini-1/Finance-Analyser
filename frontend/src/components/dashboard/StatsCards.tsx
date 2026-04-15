import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/context/CurrencyContext';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  currentBalance: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  avgMonthlySavings: number;
  savingsRate: number;
}

export function StatsCards({ 
  currentBalance,
  avgMonthlyIncome, 
  avgMonthlyExpenses, 
  avgMonthlySavings, 
  savingsRate 
}: StatsCardsProps) {
  const { formatCurrency } = useCurrency();

  const stats = [
    {
      title: 'Avg. Monthly Income',
      value: formatCurrency(avgMonthlyIncome),
      icon: TrendingUp,
      iconClass: 'text-success bg-success/10',
      trend: 'Last 6 months average',
    },
    {
      title: 'Avg. Monthly Expenses',
      value: formatCurrency(avgMonthlyExpenses),
      icon: TrendingDown,
      iconClass: 'text-expense bg-destructive/10',
      trend: 'Last 6 months average',
    },
    {
      title: 'Avg. Monthly Savings',
      value: formatCurrency(avgMonthlySavings),
      icon: Wallet,
      iconClass: cn(
        avgMonthlySavings >= 0 ? 'text-success bg-success/10' : 'text-expense bg-destructive/10'
      ),
      trend: avgMonthlySavings >= 0 ? 'Positive savings' : 'Negative savings',
    },
    {
      title: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      iconClass: 'text-savings bg-savings/10',
      trend: savingsRate >= 20 ? 'Healthy savings!' : 'Try to save more',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground border-none shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 p-8 opacity-10">
          <CreditCard className="h-24 w-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-90 uppercase tracking-wider">
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl md:text-5xl font-bold">{formatCurrency(currentBalance)}</div>
          <p className="text-sm opacity-80 mt-2">Total net worth across all tracked transactions</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn('rounded-lg p-2', stat.iconClass)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
