import { View, Text } from 'react-native';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/utils';

// --- CVA Variants for the Badge Container ---
const badgeVariants = cva(
  // Base classes for the container View
  'flex-row items-center self-start rounded-md border px-2 py-0.5',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary',
        secondary: 'border-transparent bg-secondary',
        destructive: 'border-transparent bg-destructive',
        outline: 'border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// --- CVA Variants for the Text inside the Badge ---
const badgeTextVariants = cva(
  // Base classes for the Text component
  'text-[8px] font-medium',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        destructive: 'text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Badge = ({ className, textClassName, variant, children, ...props }) => {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      {/* If children are a string, we wrap it in a Text component with the correct styles.
        If children are already a component (like an Icon), we render it directly.
        This allows for flexible composition.
      */}
      {typeof children === 'string' ? (
        <Text className={cn(badgeTextVariants({ variant }), textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

export { Badge, badgeVariants };
