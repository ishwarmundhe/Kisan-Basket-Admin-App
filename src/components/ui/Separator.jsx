import React from 'react';
import { View } from 'react-native';
import { cn } from '../../lib/utils';

const Separator = React.forwardRef(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          'shrink-0 bg-border',
          orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
          className,
        )}
        {...props}
      />
    );
  },
);
Separator.displayName = 'Separator';

export { Separator };
