/**
 * Date Picker with Range Component
 * By Cheva
 */

import React from 'react';
import {Calendar} from 'lucide-react';
import { Button } from './button';
import { cn } from '@/utils/utils';

interface DatePickerWithRangeProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
  className?: string;
}

export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <Button variant="outline" className={cn("justify-start text-left font-normal", className)}>
      <Calendar className="mr-2 h-4 w-4" />
      {value.from.toLocaleDateString()} - {value.to.toLocaleDateString()}
    </Button>
  );
};