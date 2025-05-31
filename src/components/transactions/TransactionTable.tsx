"use client";
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3, DollarSign } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { Transaction } from '@/libs/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getCurrencySymbol } from '@/libs/currencies';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void; // Placeholder for edit functionality
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onEdit }) => {
  const { deleteTransaction, categories, currentCurrency } = useAppContext();
  const { toast } = useToast();
  const currencySymbol = getCurrencySymbol(currentCurrency);

  const handleDelete = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
    toast({ title: "Transaction Deleted", description: `${transaction.description} was removed.`});
  };

  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No transactions found. Add one to get started!</p>;
  }

  return (
      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.categoryId);
              const CategoryIcon = category?.icon || DollarSign;
              return (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center w-fit gap-1" style={{borderColor: category?.color, color: category?.color}}>
                        <CategoryIcon size={14} /> {category?.name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}
                             className={transaction.type === 'income' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* <Button variant="ghost" size="icon" onClick={() => onEdit && onEdit(transaction)} className="mr-2" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </Button> */}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction)} title="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
  );
};

export default TransactionTable;