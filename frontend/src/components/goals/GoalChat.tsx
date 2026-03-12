import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/context/CurrencyContext';
import { Bot, User, Send, Loader2, Sparkles, TrendingUp, Target, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: 'goal_created' | 'transaction_created' | 'goal_updated';
    goalTitle?: string;
    targetAmount?: number;
    transactionType?: 'income' | 'expense';
    amount?: number;
    category?: string;
    newSavings?: number;
  };
  timestamp: Date;
}

interface GoalChatProps {
  onGoalCreated: () => void;
  onTransactionCreated: () => void;
}

const SUGGESTED_PROMPTS = [
  "I want to save ₹5 lakhs for a car in 2 years",
  "Am I saving enough to meet my goals?",
  "I spent ₹3000 on groceries today",
  "My salary this month is ₹60,000",
  "What's a realistic goal given my income?",
];

function ActionBadge({ action }: { action: NonNullable<Message['action']> }) {
  const { formatCurrency } = useCurrency();

  if (action.type === 'goal_created') {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2">
        <Target className="h-3 w-3 shrink-0" />
        <span>✓ Goal saved: <strong>{action.goalTitle}</strong> — Target: {formatCurrency(action.targetAmount || 0)}</span>
      </div>
    );
  }

  if (action.type === 'transaction_created') {
    const isIncome = action.transactionType === 'income';
    return (
      <div className={cn(
        "mt-2 flex items-center gap-2 text-xs rounded-lg px-3 py-2 border",
        isIncome ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
      )}>
        {isIncome ? <ArrowUpCircle className="h-3 w-3 shrink-0" /> : <ArrowDownCircle className="h-3 w-3 shrink-0" />}
        <span>✓ {isIncome ? 'Income' : 'Expense'} logged: <strong>{action.category}</strong> — {formatCurrency(action.amount || 0)}</span>
      </div>
    );
  }

  if (action.type === 'goal_updated') {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-3 py-2">
        <TrendingUp className="h-3 w-3 shrink-0" />
        <span>✓ Progress updated: <strong>{action.goalTitle}</strong> — Total saved: {formatCurrency(action.newSavings || 0)}</span>
      </div>
    );
  }

  return null;
}

// Render markdown-style bold (**text**) in messages
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

export function GoalChat({ onGoalCreated, onTransactionCreated }: GoalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AI financial assistant 👋\n\nI have access to your real income, expenses, and goals — so my advice is personalised to your actual situation.\n\nI can help you:\n• **Set financial goals** — just describe what you want to achieve\n• **Log transactions** — tell me about income or spending\n• **Check if goals are realistic** — I'll do the math with your real numbers\n• **Give financial advice** — based on your actual spending patterns\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      // Send last 10 messages as context (skip welcome message)
      const history = messages
        .slice(1)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim(), conversationHistory: history }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to get response');
      }

      const data = await response.json();
      const { reply, action } = data.data;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          action: action || undefined,
          timestamp: new Date(),
        },
      ]);

      if (action?.type === 'goal_created' || action?.type === 'goal_updated') {
        onGoalCreated();
      }
      if (action?.type === 'transaction_created') {
        onTransactionCreated();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I ran into an issue: ${errorMsg}\n\nPlease check that your backend is running and GEMINI_API_KEY is set in your .env file.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className="flex flex-col border-primary/20" style={{ height: '620px' }}>
      {/* Header */}
      <CardHeader className="pb-3 border-b shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          AI Financial Assistant
          <span className="ml-auto text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            Gemini 1.5 Flash
          </span>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            )}>
              {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className={cn('max-w-[80%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn(
                'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-secondary text-secondary-foreground rounded-tl-sm'
              )}>
                <MessageContent content={msg.content} />
              </div>

              {msg.action && <ActionBadge action={msg.action} />}

              <p className={cn('text-xs text-muted-foreground px-1 mt-1', msg.role === 'user' ? 'text-right' : 'text-left')}>
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </CardContent>

      {/* Suggested prompts — only at start */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-xs text-muted-foreground mb-2">Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-secondary hover:bg-primary/10 border border-border text-secondary-foreground px-3 py-1.5 rounded-full transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your finances..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}