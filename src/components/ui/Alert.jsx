import React, { createContext, useContext } from 'react';
import { View, Text } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';



// --- Context to pass variant to children ---
const AlertContext = createContext({ variant: 'default' });

const useAlert = () => {
  return useContext(AlertContext);
};

// --- CVA Variants for the Alert Container ---
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 flex-row items-start gap-x-3',
  {
    variants: {
      variant: {
        default: 'bg-background',
        destructive: 'border-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// --- Alert Components ---
const Alert = ({ className, variant, children, ...props }) => {
  return (
    <AlertContext.Provider value={{ variant }}>
      <View
        className={cn(alertVariants({ variant }), className)}
        role="alert"
        {...props}
      >
        {children}
      </View>
    </AlertContext.Provider>
  );
};

const AlertTitle = ({ className, children, ...props }) => {
  const { variant } = useAlert();
  return (
    <Text
      className={cn(
        'font-medium tracking-tight',
        variant === 'destructive' ? 'text-destructive' : 'text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
};

const AlertDescription = ({ className, children, ...props }) => {
  const { variant } = useAlert();
  return (
    <Text
      className={cn(
        'text-sm',
        variant === 'destructive'
          ? 'text-destructive'
          : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
};

export { Alert, AlertTitle, AlertDescription };
