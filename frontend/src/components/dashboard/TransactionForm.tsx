import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types/finance';
import { Plus, ArrowUpCircle, ArrowDownCircle, UploadCloud, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionFormProps {
  onSubmit: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
  onExtractSuccess?: () => void;
}

const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Rental', 'Business', 'Other'];
const expenseCategories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Education', 'Other'];

export function TransactionForm({ onSubmit, onExtractSuccess }: TransactionFormProps) {
  const { currency } = useCurrency();
  const [type, setType] = useState<'income' | 'expense' | 'upload'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  const [date, setDate] = useState<Date>(new Date());
  const [isMultiDate, setIsMultiDate] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'upload') return;
    if (!amount || !category) return;

    const parsedAmount = parseFloat(amount);
    
    if (isMultiDate) {
      if (selectedDates.length === 0) return;
      const txns = selectedDates.map(d => ({
        type: type as 'income' | 'expense',
        amount: parsedAmount,
        category,
        description,
        date: d.toISOString().split('T')[0],
      }));
      onSubmit(txns);
    } else {
      onSubmit([{
        type: type as 'income' | 'expense',
        amount: parsedAmount,
        category,
        description,
        date: date.toISOString().split('T')[0],
      }]);
    }

    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date());
    setSelectedDates([]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/transactions/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attachedFile: {
            data: base64Data,
            mimeType: file.type,
            name: file.name
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to extract transactions');
      
      setFile(null);
      setType('expense');
      if (onExtractSuccess) onExtractSuccess();
    } catch (err) {
      alert("Failed to extract: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'income' ? 'default' : 'outline'}
              className={type === 'income' ? 'bg-success hover:bg-success/90 flex-1 px-2' : 'flex-1 px-2'}
              onClick={() => {
                setType('income');
                setCategory('');
              }}
            >
              <ArrowUpCircle className="mr-1 h-4 w-4" />
              Inc
            </Button>
            <Button
              type="button"
              variant={type === 'expense' ? 'default' : 'outline'}
              className={type === 'expense' ? 'bg-destructive hover:bg-destructive/90 flex-1 px-2' : 'flex-1 px-2'}
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
            >
              <ArrowDownCircle className="mr-1 h-4 w-4" />
              Exp
            </Button>
            <Button
              type="button"
              variant={type === 'upload' ? 'default' : 'outline'}
              className="flex-1 px-2"
              onClick={() => setType('upload')}
            >
              <UploadCloud className="mr-1 h-4 w-4" />
              Receipt
            </Button>
          </div>

          {type === 'upload' ? (
            <div className="space-y-4">
               <div 
                 className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                 <p className="text-sm font-medium">Click to select a receipt</p>
                 <p className="text-xs text-muted-foreground mt-1">{file ? file.name : "JPG, PNG, PDF, CSV"}</p>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={(e) => setFile(e.target.files?.[0] || null)} 
                   className="hidden" 
                   accept="image/*,.pdf,.csv"
                 />
               </div>
               <Button 
                 type="button" 
                 className="w-full" 
                 disabled={!file || isUploading}
                 onClick={handleUpload}
               >
                 {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                 {isUploading ? "Extracting..." : "Upload & Extract"}
               </Button>
            </div>
          ) : (
            <>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency === 'INR' ? '₹' : '$'}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Date(s)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="checkbox" 
                  id="multi-date" 
                  className="w-4 h-4" 
                  checked={isMultiDate} 
                  onChange={(e) => setIsMultiDate(e.target.checked)}
                />
                <Label htmlFor="multi-date" className="text-xs cursor-pointer">Multi-select</Label>
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && !selectedDates.length && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isMultiDate ? (
                    selectedDates.length > 0 
                      ? `${selectedDates.length} dates selected`
                      : "Select dates"
                  ) : (
                    date ? format(date, "PPP") : "Pick a date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {isMultiDate ? (
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    initialFocus
                  />
                ) : (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => setDate(d || new Date())}
                    initialFocus
                  />
                )}
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full">
            Add {isMultiDate ? `Series of ${type}s` : type}
          </Button>
          </>
        )}
        </form>
      </CardContent>
    </Card>
  );
}
