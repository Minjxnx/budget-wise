import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string; // for charts and visual distinction
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string for date
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spentAmount?: number; // Calculated field
  remainingAmount?: number; // Calculated field
  period: 'monthly'; // For now, only monthly budgets
  startDate: string; // ISO string for start date of budget period
}

export interface Insight {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number; // Percentage change
  icon?: LucideIcon;
  color?: string;
}
