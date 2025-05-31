"use client";
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { getCurrencySymbol } from '@/libs/currencies';

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  // period: z.enum(['monthly']), // Only monthly for now
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  onFormSubmit?: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onFormSubmit }) => {
  const { addBudget, categories, budgets, currentCurrency } = useAppContext();
  const { toast } = useToast();
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: '',
      amount: 0,
      // period: 'monthly',
    },
  });
  const { control, handleSubmit, formState: { errors }, reset } = form;

  const availableCategories = categories.filter(
      cat => cat.name.toLowerCase() !== 'income' && !budgets.find(b => b.categoryId === cat.id)
  );


  const onSubmit = (data: BudgetFormValues) => {
    addBudget({ ...data, period: 'monthly' });
    toast({ title: "Budget Created", description: `Budget for ${categories.find(c=>c.id === data.categoryId)?.name} set to ${currencySymbol}${data.amount}.`});
    reset();
    if (onFormSubmit) onFormSubmit();
  };

  return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.length > 0 ? availableCategories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                        )) : <SelectItem value="no-cat" disabled>No categories available for new budget</SelectItem>}
                      </SelectContent>
                    </Select>
                )}
            />
            {errors.categoryId && <p className="text-sm text-destructive mt-1">{errors.categoryId.message}</p>}
          </div>
          <div>
            <Label htmlFor="amount">Monthly Budget Amount</Label>
            <Controller
                name="amount"
                control={control}
                render={({ field }) => <Input id="amount" type="number" step="0.01" {...field} placeholder="0.00" />}
            />
            {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full md:w-auto" disabled={availableCategories.length === 0}>Set Budget</Button>
      </form>
  );
};

export default BudgetForm;