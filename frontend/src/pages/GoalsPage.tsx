import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { GoalInput, GoalList } from '@/components/goals/GoalComponents';
import { GoalChat } from '@/components/goals/GoalChat';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, MessageSquare, ListTodo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FinancialGoal } from '@/types/finance';
import { cn } from '@/lib/utils';

type Tab = 'chat' | 'goals';

export function GoalsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const {
    goals, addGoal, deleteGoal, addToGoal,
    calculateScenarios, totalProgress, isLoading, error, refetch: refetchGoals,
  } = useGoals();
  const { refetch: refetchTransactions } = useTransactions();
  const { toast } = useToast();

  useEffect(() => {
    if (error) toast({ title: 'Error', description: error, variant: 'destructive' });
  }, [error]);

  const handleAddGoal = async (input: string) => {
    try {
      const result = await addGoal(input) as any;
      const msg = result?.llmEnhanced
        ? `Goal created: "${result.goal?.description}" — ${result.llmEnhanced.refinedCategory}`
        : 'Goal created successfully';
      toast({ title: 'Goal Added ✓', description: msg });
    } catch {
      toast({ title: 'Error', description: 'Failed to create goal. Try again.', variant: 'destructive' });
    }
  };

  const getScenarios = (goal: FinancialGoal) => calculateScenarios(goal);

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Chat with your AI assistant or manage your goals manually.
          </p>
        </div>

        {/* Overall progress bar */}
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

        {/* Tab switcher */}
        <div className="flex gap-2 border-b">
          {([
            { id: 'chat' as Tab, label: 'AI Assistant', icon: MessageSquare },
            { id: 'goals' as Tab, label: 'My Goals', icon: ListTodo },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'goals' && goals.length > 0 && (
                <span className="ml-1 bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                  {goals.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'chat' && (
          <GoalChat
            onGoalCreated={refetchGoals}
            onTransactionCreated={refetchTransactions}
          />
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <GoalInput onSubmit={handleAddGoal} />
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading goals...</p>
            ) : (
              <GoalList
                goals={goals}
                onDelete={deleteGoal}
                onAddFunds={addToGoal}
                getScenarios={getScenarios}
              />
            )}
          </div>
        )}

      </div>
    </MainLayout>
  );
}