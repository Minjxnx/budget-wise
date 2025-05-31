
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/libs/utils";
import { useAppContext } from '@/contexts/AppContext';
import type { Transaction, TransactionType } from '@/libs/types';
import { categorizeTransaction } from '@/ai/flows/categorize-transactions';
import { useToast } from '@/hooks/use-toast';

const transactionFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, "Category is required"),
  date: z.date({ required_error: "Date is required" }),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  onFormSubmit?: () => void;
  initialData?: Partial<Transaction>; // For editing, not implemented yet
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onFormSubmit }) => {
  const { addTransaction, categories } = useAppContext();
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      date: new Date(),
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;
  const descriptionWatch = watch('description');

  const handleSmartCategorize = useCallback(async (description: string) => {
    if (description.length < 3 || isCategorizing) return;
    setIsCategorizing(true);
    try {
      const result = await categorizeTransaction({
        transactionDescription: description,
        previousCategories: categories.map(c => c.name),
      });
      const matchedCategory = categories.find(c => c.name.toLowerCase() === result.category.toLowerCase());
      if (matchedCategory) {
        setSuggestedCategoryId(matchedCategory.id);
        setValue('categoryId', matchedCategory.id, { shouldValidate: true });
        toast({ title: "Smart Category", description: `Suggested: ${matchedCategory.name}` });
      } else {
         toast({ title: "Smart Category", description: `Could not match AI suggestion: ${result.category}`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Smart categorization error:", error);
      toast({ title: "Categorization Error", description: "Could not suggest category.", variant: "destructive" });
    } finally {
      setIsCategorizing(false);
    }
  }, [categories, setValue, toast, isCategorizing]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (descriptionWatch) {
        handleSmartCategorize(descriptionWatch);
      }
    }, 1000); // Debounce AI call
    return () => clearTimeout(debounceTimer);
  }, [descriptionWatch, handleSmartCategorize]);


  const onSubmit = (data: TransactionFormValues) => {
    addTransaction({ ...data, date: data.date.toISOString() });
    toast({ title: "Transaction Added", description: `${data.description} for $${data.amount} was successfully added.`});
    form.reset();
    setSuggestedCategoryId(null);
    if (onFormSubmit) onFormSubmit();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
      <div>
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Input id="description" {...field} placeholder="e.g., Coffee, Salary" />}
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => <Input id="amount" type="number" step="0.01" {...field} placeholder="0.00" />}
          />
          {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <Label>Type</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex items-center space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoryId">Category {isCategorizing && <Loader2 className="h-4 w-4 animate-spin inline ml-2" />}</Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>}
           {suggestedCategoryId && !errors.categoryId && (
             <p className="text-xs text-muted-foreground mt-1">AI Suggested: {categories.find(c=>c.id === suggestedCategoryId)?.name}</p>
           )}
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
           <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full md:w-auto" disabled={isCategorizing}>
        {isCategorizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Transaction
      </Button>
    </form>
  );
};

export default TransactionForm;
