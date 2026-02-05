import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function StatsCards({ totalIncome, totalExpenses, netBalance, savingsRate }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      iconClass: 'text-success bg-success/10',
      trend: '+12% from last month',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      iconClass: 'text-expense bg-destructive/10',
      trend: '-3% from last month',
    },
    {
      title: 'Net Balance',
      value: formatCurrency(netBalance),
      icon: Wallet,
      iconClass: cn(
        netBalance >= 0 ? 'text-success bg-success/10' : 'text-expense bg-destructive/10'
      ),
      trend: netBalance >= 0 ? 'Positive balance' : 'Negative balance',
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
  );
}
