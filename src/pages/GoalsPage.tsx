import { MainLayout } from '@/components/layout/MainLayout';
import { GoalInput, GoalList } from '@/components/goals/GoalComponents';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

export function GoalsPage() {
  const { goals, addGoal, deleteGoal, addToGoal, calculateScenarios, totalProgress } = useGoals();
  const { summary } = useTransactions();

  const getScenarios = (goal: any) => {
    // Calculate average monthly income/expenses
    const avgMonthlyIncome = summary.totalIncome / 6 || 0;
    const avgMonthlyExpenses = summary.totalExpenses / 6 || 0;
    return calculateScenarios(goal, avgMonthlyIncome, avgMonthlyExpenses);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Set and track your financial goals using natural language.
          </p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Overall Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{goals.length} active goal{goals.length !== 1 ? 's' : ''}</span>
                <span className="font-medium">{totalProgress.toFixed(1)}% complete</span>
              </div>
              <Progress value={totalProgress} className="h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Goal Input */}
        <GoalInput onSubmit={addGoal} />

        {/* Goals List */}
        <GoalList
          goals={goals}
          onDelete={deleteGoal}
          onAddFunds={addToGoal}
          getScenarios={getScenarios}
        />
      </div>
    </MainLayout>
  );
}
