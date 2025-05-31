"use client";
import React from "react";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import type { Transaction } from "@/libs/types";
import { format, startOfMonth, parseISO } from 'date-fns';
import { useAppContext } from "@/contexts/AppContext";
import { getCurrencySymbol } from "@/libs/currencies";

interface MonthlyBarChartProps {
  transactions: Transaction[];
}

const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({ transactions }) => {
  const { currentCurrency } = useAppContext();
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const dataByMonth = transactions.reduce((acc, transaction) => {
    const month = format(startOfMonth(parseISO(transaction.date)), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { name: month, income: 0, expenses: 0 };
    }
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { name: string; income: number; expenses: number }>);

  const chartData = Object.values(dataByMonth).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime()).slice(-6); // Last 6 months

  if (chartData.length === 0) {
    return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Monthly Income vs. Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No transaction data available to display chart.</p>
          </CardContent>
        </Card>
    );
  }

  const chartConfig = {
    income: { label: "Income", color: "hsl(var(--chart-1))" },
    expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  // Tooltip formatter function
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
          <div className="p-2 bg-background border border-border shadow-lg rounded-md">
            <p className="label text-sm font-medium">{`${label}`}</p>
            {payload.map((pld: any) => (
                <p key={pld.dataKey} style={{ color: pld.color }} className="text-xs">
                  {`${pld.name}: ${currencySymbol}${pld.value.toFixed(2)}`}
                </p>
            ))}
          </div>
      );
    }
    return null;
  };

  return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Income vs. Expenses</CardTitle>
          <CardDescription>Comparison of your total income and expenses over the past few months.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <RechartsBarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
              <YAxis
                  tickFormatter={(value) => `${currencySymbol}${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
              />
              <ChartTooltip
                  cursor={false}
                  content={<CustomTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
  );
};

export default MonthlyBarChart;