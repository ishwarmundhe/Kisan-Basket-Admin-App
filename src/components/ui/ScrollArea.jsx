import React from 'react';
import { ScrollView } from 'react-native';
import { cn } from '../../lib/utils';

const ScrollArea = React.forwardRef(
  ({ className, contentClassName, children, ...props }, ref) => {
    return (
      <ScrollView
        ref={ref}
        className={cn('relative overflow-hidden', className)}
        // contentContainerClassName is the NativeWind equivalent of contentContainerStyle
        contentContainerClassName={cn('p-4', contentClassName)}
        {...props}
      >
        {children}
      </ScrollView>
    );
  },
);
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
