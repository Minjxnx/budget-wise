import type { Category, Transaction, Budget } from '@/lib/types';
import { ShoppingBag, Lightbulb, Home, Car, HeartPulse, Utensils, Ticket, TrendingUp, CircleDollarSign, Landmark, LucideIcon } from 'lucide-react';

export const defaultCategories: Category[] = [
  { id: 'groceries', name: 'Groceries', icon: ShoppingBag, color: 'hsl(var(--chart-1))' },
  { id: 'utilities', name: 'Utilities', icon: Lightbulb, color: 'hsl(var(--chart-2))' },
  { id: 'rent', name: 'Rent/Mortgage', icon: Home, color: 'hsl(var(--chart-3))' },
  { id: 'transport', name: 'Transportation', icon: Car, color: 'hsl(var(--chart-4))' },
  { id: 'health', name: 'Healthcare', icon: HeartPulse, color: 'hsl(var(--chart-5))' },
  { id: 'dining', name: 'Dining Out', icon: Utensils, color: 'hsl(197, 71%, 73%)' },
  { id: 'entertain', name: 'Entertainment', icon: Ticket, color: 'hsl(291, 71%, 73%)' },
  { id: 'income', name: 'Income', icon: Landmark, color: 'hsl(120, 50%, 60%)' }, // Income typically has a distinct color
  { id: 'other', name: 'Other', icon: CircleDollarSign, color: 'hsl(0, 0%, 70%)' },
];

// Sample transactions and budgets are removed as data will now come from Firestore.
// For local development or testing without auth, you might want to conditionally use them,
// but for a production app with Firestore, they are not needed here.
// export const sampleTransactions: Transaction[] = [ ... ];
// export const sampleBudgets: Budget[] = [ ... ];


export function getCategoryName(categoryId: string, categories: Category[] = defaultCategories): string {
  return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
}

export function getCategoryIcon(categoryId: string, categories: Category[] = defaultCategories): LucideIcon | undefined {
  return categories.find(cat => cat.id === categoryId)?.icon;
}

export function getCategoryColor(categoryId: string, categories: Category[] = defaultCategories): string {
  return categories.find(cat => cat.id === categoryId)?.color || 'hsl(var(--muted-foreground))';
}
