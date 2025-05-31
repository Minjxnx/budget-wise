"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Edit } from 'lucide-react';
import type { Budget, Category, Transaction } from '@/libs/types';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { getCurrencySymbol } from '@/libs/currencies';

interface BudgetCardProps {
  budget: Budget;
  transactions: Transaction[];
  onEdit?: (budget: Budget) => void; // For future edit functionality
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, transactions, onEdit }) => {
  const { deleteBudget, getCategoryById, currentCurrency } = useAppContext();
  const { toast } = useToast();
  const category = getCategoryById(budget.categoryId);
  const currencySymbol = getCurrencySymbol(currentCurrency);

  if (!category) return null; // Should not happen if data is consistent

  const spentAmount = transactions
      .filter(t => t.categoryId === budget.categoryId && t.type === 'expense' && new Date(t.date) >= new Date(budget.startDate))
      .reduce((sum, t) => sum + t.amount, 0);

  const progress = Math.min((spentAmount / budget.amount) * 100, 100); // Cap at 100 for visual
  const actualProgress = (spentAmount / budget.amount) * 100; // Can be > 100
  const remainingAmount = budget.amount - spentAmount;

  const handleDelete = () => {
    deleteBudget(budget.id);
    toast({ title: "Budget Deleted", description: `Budget for ${category.name} was removed.`});
  };

  const CategoryIcon = category.icon;

  return (
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CategoryIcon className="h-5 w-5" style={{color: category.color}} />
                {category.name}
              </CardTitle>
              <CardDescription>Target: {currencySymbol}{budget.amount.toFixed(2)}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete Budget">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progress} className={actualProgress > 100 ? '[&>div]:bg-red-500' : '[&>div]:bg-primary'} />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent: {currencySymbol}{spentAmount.toFixed(2)}</span>
            <span className={`font-medium ${remainingAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
            {remainingAmount >= 0 ? `Remaining: ${currencySymbol}${remainingAmount.toFixed(2)}` : `Overspent: ${currencySymbol}${Math.abs(remainingAmount).toFixed(2)}`}
          </span>
          </div>
          {actualProgress > 100 && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                You've exceeded this budget!
              </p>
          )}
          {/* <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onEdit && onEdit(budget)}>
            <Edit className="mr-2 h-3 w-3" /> Edit Budget
        </Button> */}
        </CardContent>
      </Card>
  );
};

export default BudgetCard;