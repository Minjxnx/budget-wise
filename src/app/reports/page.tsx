
"use client";
import React from 'react';
import AppShell from '@/components/AppShell';
import CategoryPieChart from '@/components/reports/CategoryPieChart';
import MonthlyBarChart from '@/components/reports/MonthlyBarChart';
import { useAppContext } from '@/contexts/AppContext';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const { transactions, categories } = useAppContext();

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
           <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Reports & Analysis
          </h1>
          <p className="text-muted-foreground">Visualize your spending habits and financial trends.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPieChart transactions={transactions} categories={categories} />
          <MonthlyBarChart transactions={transactions} />
        </div>
        
        {/* Placeholder for more reports */}
        {/* <Card>
          <CardHeader><CardTitle>More Reports Coming Soon!</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">We're working on adding more insightful reports to help you manage your finances.</p></CardContent>
        </Card> */}
      </div>
    </AppShell>
  );
}
