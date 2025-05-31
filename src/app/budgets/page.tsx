
"use client";
import React from 'react';
import AppShell from '@/components/AppShell';
import BudgetForm from '@/components/budgets/BudgetForm';
import BudgetCard from '@/components/budgets/BudgetCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Target } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, transactions } = useAppContext();

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" /> Budgets
          </h1>
          <p className="text-muted-foreground">Set and manage your monthly spending goals for different categories.</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create New Budget</CardTitle>
            <CardDescription>Define a new monthly budget for a category.</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm />
          </CardContent>
        </Card>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Your Budgets</h2>
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map(budget => (
                <BudgetCard key={budget.id} budget={budget} transactions={transactions} />
              ))}
            </div>
          ) : (
            <Card className="shadow-sm border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">You haven't set any budgets yet.</p>
                <p className="text-sm text-muted-foreground">Create one above to start tracking!</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </AppShell>
  );
}
