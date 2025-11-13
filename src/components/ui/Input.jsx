import React from 'react';
import { TextInput } from 'react-native';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      placeholderTextColor="#6b7360"
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
