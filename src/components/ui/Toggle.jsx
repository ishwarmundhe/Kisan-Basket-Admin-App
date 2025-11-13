import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const toggleVariants = cva(
  'flex-row items-center justify-center gap-x-2 rounded-md disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'bg-transparent border border-input',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      pressed: controlledPressed,
      onPressedChange,
      defaultPressed = false,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalPressed, setInternalPressed] =
      React.useState(defaultPressed);
    const isPressed =
      controlledPressed !== undefined ? controlledPressed : internalPressed;

    const handlePress = () => {
      const newValue = !isPressed;
      if (controlledPressed === undefined) {
        setInternalPressed(newValue);
      }
      onPressedChange?.(newValue);
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        className={cn(
          toggleVariants({ variant, size, className }),
          isPressed && 'bg-accent',
        )}
        accessibilityState={{ selected: isPressed }}
        {...props}
      >
        {/* If child is a string, wrap it in a Text component and style it */}
        {typeof children === 'string' ? (
          <Text
            className={cn(
              'text-sm font-medium',
              isPressed ? 'text-accent-foreground' : 'text-muted-foreground',
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  },
);
Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
