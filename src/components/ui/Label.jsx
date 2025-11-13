import React from 'react';
import { Text } from 'react-native';
import { cn } from '../../lib/utils'; // Adjust path

const Label = React.forwardRef(
  ({ className, disabled, children, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none text-foreground',
          disabled && 'opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </Text>
    );
  },
);
Label.displayName = 'Label';

export { Label };
