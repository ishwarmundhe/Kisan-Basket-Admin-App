import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Define variants for a Toggle button, which ToggleGroupItem will use.
const toggleVariants = cva(
  'flex-row items-center justify-center text-sm font-medium',
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

// --- Context for State Management ---
const ToggleGroupContext = React.createContext(null);

// --- Main Components ---
const ToggleGroup = ({
  className,
  variant,
  size,
  children,
  type = 'single',
  value: controlledValue,
  onValueChange,
  defaultValue,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = itemValue => {
    let newValue;
    if (type === 'multiple') {
      newValue = value?.includes(itemValue)
        ? value.filter(v => v !== itemValue)
        : [...(value || []), itemValue];
    } else {
      newValue = value === itemValue ? undefined : itemValue;
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = {
    variant,
    size,
    value,
    onValueChange: handleValueChange,
  };

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <View
        className={cn(
          'flex-row items-center justify-center rounded-md',
          className,
        )}
        {...props}
      >
        {children}
      </View>
    </ToggleGroupContext.Provider>
  );
};

const ToggleGroupItem = React.forwardRef(
  ({ className, children, variant, size, value, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext);

    const isSelected =
      context.value === value ||
      (Array.isArray(context.value) && context.value.includes(value));

    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => context.onValueChange(value)}
        className={cn(
          toggleVariants({
            variant: context.variant || variant,
            size: context.size || size,
          }),
          // Specific styles for grouping
          'first:rounded-l-md last:rounded-r-md',
          context.variant === 'outline' && 'border-l-0 first:border-l',
          isSelected && 'bg-accent',
          className,
        )}
        accessibilityState={{ selected: isSelected }}
        {...props}
      >
        {/* If child is string, wrap in Text and style based on selection */}
        {typeof children === 'string' ? (
          <Text
            className={cn(
              'font-medium text-sm',
              isSelected ? 'text-accent-foreground' : 'text-muted-foreground',
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
ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem, toggleVariants };
