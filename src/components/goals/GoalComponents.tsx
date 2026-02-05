import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { FinancialGoal, SavingsScenario } from '@/types/finance';
import { Target, Sparkles, Trash2, Plus, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalInputProps {
  onSubmit: (text: string) => void;
}

interface GoalCardProps {
  goal: FinancialGoal;
  scenarios: SavingsScenario[];
  onDelete: (id: string) => void;
  onAddFunds: (id: string, amount: number) => void;
}

interface GoalListProps {
  goals: FinancialGoal[];
  onDelete: (id: string) => void;
  onAddFunds: (id: string, amount: number) => void;
  getScenarios: (goal: FinancialGoal) => SavingsScenario[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function GoalInput({ onSubmit }: GoalInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Set a Financial Goal
        </CardTitle>
        <CardDescription>
          Describe your goal in natural language. Example: "Save $5000 for a vacation by December 2025"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            placeholder="I want to save $10,000 for an emergency fund in 12 months..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gradient-primary">
            <Target className="mr-2 h-4 w-4" />
            Set Goal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function GoalCard({ goal, scenarios, onDelete, onAddFunds }: GoalCardProps) {
  const [addAmount, setAddAmount] = useState('');
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleAddFunds = () => {
    const amount = parseFloat(addAmount);
    if (!isNaN(amount) && amount > 0) {
      onAddFunds(goal.id, amount);
      setAddAmount('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {goal.description}
            </CardTitle>
            <CardDescription className="mt-1">
              {goal.parsedIntent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary mr-2">
                  {goal.parsedIntent}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
              </span>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {progress.toFixed(1)}% complete
          </p>
        </div>

        {/* Add Funds */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Add funds..."
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddFunds} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Savings Scenarios */}
        {scenarios.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Savings Scenarios
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.period}
                  className="p-2 rounded-lg bg-secondary/50 text-center"
                >
                  <p className="text-xs text-muted-foreground capitalize">{scenario.period}</p>
                  <p className="font-semibold text-sm">{formatCurrency(scenario.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Original input */}
        <p className="text-xs text-muted-foreground italic">
          "{goal.naturalLanguageInput}"
        </p>
      </CardContent>
    </Card>
  );
}

export function GoalList({ goals, onDelete, onAddFunds, getScenarios }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No goals yet</h3>
        <p className="text-muted-foreground">
          Set your first financial goal using natural language above!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          scenarios={getScenarios(goal)}
          onDelete={onDelete}
          onAddFunds={onAddFunds}
        />
      ))}
    </div>
  );
}
