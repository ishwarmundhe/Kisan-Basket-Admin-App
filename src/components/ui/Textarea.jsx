import React from 'react';
import { TextInput } from 'react-native';
import { cn } from '../../lib/utils';
import { colors } from '../../config/theme'; // Import colors from your central theme file

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      multiline
      textAlignVertical="top" // Ensures text starts from the top
      placeholderTextColor={colors['muted-foreground']}
      className={cn(
        'min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base',
        'focus:border-primary focus:ring-1 focus:ring-primary', // NativeWind focus styles
        'disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
