import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { cn } from '../../lib/utils';

// --- Main Components ---
const Table = ({ className, children, ...props }) => (
  // Horizontal scroll for wider tables
  <ScrollView horizontal>
    <View role="table" className={cn('w-full text-sm', className)} {...props}>
      {children}
    </View>
  </ScrollView>
);

const TableHeader = ({ className, ...props }) => (
  <View
    role="rowgroup"
    className={cn('border-b border-border', className)}
    {...props}
  />
);

const TableBody = ({ className, ...props }) => (
  <View role="rowgroup" className={cn('', className)} {...props} />
);

const TableFooter = ({ className, ...props }) => (
  <View
    role="rowgroup"
    className={cn('border-t border-border bg-muted/50 font-medium', className)}
    {...props}
  />
);

const TableRow = ({ className, selected, ...props }) => (
  <View
    role="row"
    className={cn(
      'flex-row border-b border-border transition-colors',
      selected && 'bg-muted',
      className,
    )}
    {...props}
  />
);

const TableHead = ({ className, children, ...props }) => (
  <View
    role="columnheader"
    className={cn(
      'h-10 px-3 justify-center text-left align-middle font-medium',
      className,
    )}
    {...props}
  >
    {/* Ensure child is a Text component */}
    {typeof children === 'string' ? (
      <Text className="text-sm font-medium text-foreground">{children}</Text>
    ) : (
      children
    )}
  </View>
);

const TableCell = ({ className, children, ...props }) => (
  <View role="cell" className={cn('p-3 align-middle', className)} {...props}>
    {typeof children === 'string' ? (
      <Text className="text-sm text-foreground">{children}</Text>
    ) : (
      children
    )}
  </View>
);

const TableCaption = ({ className, ...props }) => (
  <Text
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
