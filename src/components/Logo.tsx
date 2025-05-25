import { PiggyBank } from 'lucide-react';
import React from 'react';

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const textSizeClass = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl';
  const iconSize = size === 'lg' ? 32 : size === 'md' ? 28 : 24;

  return (
    <div className="flex items-center gap-2">
      <PiggyBank className="text-primary" size={iconSize} />
      <span className={`font-bold ${textSizeClass} text-foreground`}>
        BudgetWise
      </span>
    </div>
  );
};

export default Logo;
