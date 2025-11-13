import React from 'react';
import { View, Text } from 'react-native';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { Button } from './Button'; // We reuse the Button component

// --- Main Components ---
const Pagination = ({ className, ...props }) => (
  <View
    accessibilityRole="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex-row w-full justify-center', className)}
    {...props}
  />
);

const PaginationContent = ({ className, ...props }) => (
  <View className={cn('flex-row items-center gap-x-1', className)} {...props} />
);

const PaginationItem = ({ className, ...props }) => (
  <View className={cn('', className)} {...props} />
);

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  children,
  ...props
}) => (
  <Button
    variant={isActive ? 'outline' : 'ghost'}
    size={size}
    className={cn(className)}
    {...props}
  >
    {/* If child is a number or string, wrap in Text */}
    {typeof children === 'number' || typeof children === 'string' ? (
      <Text
        className={cn(isActive ? 'text-foreground' : 'text-muted-foreground')}
      >
        {children}
      </Text>
    ) : (
      children
    )}
  </Button>
);

const PaginationPrevious = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-x-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft size={16} className="text-foreground" />
    <Text className="text-foreground">Previous</Text>
  </PaginationLink>
);

const PaginationNext = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-x-1 pr-2.5', className)}
    {...props}
  >
    <Text className="text-foreground">Next</Text>
    <ChevronRight size={16} className="text-foreground" />
  </PaginationLink>
);

const PaginationEllipsis = ({ className, ...props }) => (
  <View
    aria-hidden
    className={cn('h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal size={16} className="text-foreground" />
  </View>
);

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
