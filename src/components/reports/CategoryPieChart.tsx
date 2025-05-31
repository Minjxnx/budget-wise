
"use client";
import React from "react";
import { Pie, PieChart as RechartsPieChart, Cell, Legend, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import type { Transaction, Category } from "@/libs/types";

interface CategoryPieChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions, categories }) => {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const data = categories
    .map(category => {
      const total = expenseTransactions
        .filter(t => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: category.name,
        value: total,
        fill: category.color,
        icon: category.icon,
      };
    })
    .filter(item => item.value > 0) // Only show categories with spending
    .sort((a,b) => b.value - a.value); // Sort by most spending

  if (data.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No expense data available to display chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill, icon: item.icon };
    return acc;
  }, {} as ChartConfig);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>Visual breakdown of your expenses across different categories for the current period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
          <RechartsPieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="dot" />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={2}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (percent * 100) > 5 ? ( // Only show label if percent > 5%
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="bold">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  ) : null;
              }}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" className="text-xs" />} />
          </RechartsPieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryPieChart;
