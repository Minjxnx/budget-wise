
"use client";
import React from 'react';
import AppShell from '@/components/AppShell';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionTable from '@/components/transactions/TransactionTable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { ListChecks } from 'lucide-react';

export default function TransactionsPage() {
  const { transactions } = useAppContext();

  // Sort transactions by date, newest first
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ListChecks className="h-8 w-8 text-primary" /> Transactions
          </h1>
          <p className="text-muted-foreground">Log your income and expenses, and keep track of your financial activity.</p>
        </header>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Add New Transaction</CardTitle>
            <CardDescription>Enter the details of your income or expense.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View all your past transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={sortedTransactions} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
