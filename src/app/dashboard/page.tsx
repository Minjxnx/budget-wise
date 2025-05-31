"use client";
import React from 'react';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, PieChart, BarChartHorizontalBig } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { defaultCategories, getCategoryName, getCategoryColor } from '@/libs/data';
import type { Insight } from '@/libs/types';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart as RechartsPieChart, Cell } from "recharts";
import { getCurrencySymbol } from '@/libs/currencies';


const StatCard: React.FC<Insight & { cta?: { href: string; label: string }, currencySymbol: string }> = ({ title, value, change, icon: Icon, color, cta, currencySymbol }) => {
  const changeColor = change && change > 0 ? 'text-green-500' : change && change < 0 ? 'text-red-500' : 'text-muted-foreground';
  const ChangeIcon = change && change > 0 ? TrendingUp : TrendingDown;

  return (
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {Icon && <Icon className={`h-5 w-5 ${color || 'text-muted-foreground'}`} />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{typeof value === 'number' ? `${currencySymbol}${value.toFixed(2)}` : value}</div>
          {change !== undefined && (
              <p className={`text-xs ${changeColor} flex items-center`}>
                <ChangeIcon className="h-3 w-3 mr-1" />
                {change.toFixed(1)}% from last month
              </p>
          )}
          {cta && (
              <Button asChild variant="link" className="p-0 h-auto mt-2 text-sm">
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
          )}
        </CardContent>
      </Card>
  );
};

const MiniPieChart = ({ data }: { data: { name: string, value: number, fill: string }[] }) => {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
  }, {} as ChartConfig);

  return (
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[100px] w-[100px]">
        <RechartsPieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={25} strokeWidth={2}>
            {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>
  );
};


export default function DashboardPage() {
  const { transactions, budgets, categories, currentCurrency } = useAppContext();
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const spendingByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => {
        acc[curr.categoryId] = (acc[curr.categoryId] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

  const topSpendingCategories = Object.entries(spendingByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([categoryId, amount]) => ({
        name: getCategoryName(categoryId, categories),
        value: amount,
        fill: getCategoryColor(categoryId, categories),
      }));


  const budgetOverview = budgets.map(budget => {
    const spent = spendingByCategory[budget.categoryId] || 0;
    const remaining = budget.amount - spent;
    const progress = Math.min((spent / budget.amount) * 100, 100);
    return {
      ...budget,
      categoryName: getCategoryName(budget.categoryId, categories),
      spent,
      remaining,
      progress,
    };
  });

  const insights: Insight[] = [
    { title: 'Total Income', value: totalIncome, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-red-500' },
    { title: 'Net Balance', value: netBalance, icon: DollarSign, color: netBalance >= 0 ? 'text-green-500' : 'text-red-500' },
    { title: 'Budgets Set', value: budgets.length, icon: Target, color: 'text-primary' },
  ];

  return (
      <AppShell>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {insights.map(insight => <StatCard key={insight.title} {...insight} currencySymbol={currencySymbol} />)}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChartHorizontalBig className="text-primary" /> Quick Budget Overview</CardTitle>
                <CardDescription>Track your progress on monthly budgets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetOverview.length > 0 ? budgetOverview.slice(0, 4).map(budget => (
                    <div key={budget.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{budget.categoryName}</span>
                        <span className={`text-sm font-medium ${budget.remaining < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {currencySymbol}{budget.spent.toFixed(2)} / {currencySymbol}{budget.amount.toFixed(2)}
                    </span>
                      </div>
                      <Progress value={budget.progress} className={budget.progress > 100 ? '[&>div]:bg-red-500' : '[&>div]:bg-primary'} />
                      {budget.remaining < 0 && (
                          <p className="text-xs text-red-500 mt-1 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overspent by {currencySymbol}{Math.abs(budget.remaining).toFixed(2)}
                          </p>
                      )}
                    </div>
                )) : (
                    <p className="text-muted-foreground text-sm">No budgets set yet. <Link href="/budgets" className="text-primary hover:underline">Create one now!</Link></p>
                )}
                {budgetOverview.length > 4 && (
                    <Button asChild variant="outline" size="sm" className="w-full mt-4">
                      <Link href="/budgets">View All Budgets</Link>
                    </Button>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChart className="text-accent" /> Top Spending Categories</CardTitle>
                <CardDescription>Your main expense areas this month.</CardDescription>
              </CardHeader>
              <CardContent>
                {topSpendingCategories.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <MiniPieChart data={topSpendingCategories} />
                      <ul className="mt-4 space-y-1 text-sm w-full">
                        {topSpendingCategories.map(cat => (
                            <li key={cat.name} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.fill }}></span>
                          {cat.name}
                        </span>
                              <span>{currencySymbol}{cat.value.toFixed(2)}</span>
                            </li>
                        ))}
                      </ul>
                      <Button asChild variant="outline" size="sm" className="w-full mt-4">
                        <Link href="/reports">View Full Report</Link>
                      </Button>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">No expenses logged yet. <Link href="/transactions" className="text-primary hover:underline">Add a transaction.</Link></p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>A quick look at your latest transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                  <ul className="space-y-3">
                    {transactions.slice(0, 5).map(t => {
                      const category = defaultCategories.find(c => c.id === t.categoryId);
                      const Icon = category?.icon || DollarSign;
                      return (
                          <li key={t.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`} />
                              <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-xs text-muted-foreground">{category?.name} &bull; {new Date(t.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toFixed(2)}
                      </span>
                          </li>
                      );
                    })}
                  </ul>
              ) : (
                  <p className="text-muted-foreground text-sm">No transactions yet.</p>
              )}
              <Button asChild variant="default" className="w-full mt-6">
                <Link href="/transactions">View All Transactions</Link>
              </Button>
            </CardContent>
          </Card>

        </div>
      </AppShell>
  );
}