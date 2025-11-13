import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Circle } from 'lucide-react-native';
import { cn } from '../../lib/utils';

// --- Context for State Management ---
const RadioGroupContext = React.createContext(null);

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within a <RadioGroup>');
  }
  return context;
};

// --- Main Components ---
const RadioGroup = ({
  className,
  value,
  onValueChange,
  children,
  ...props
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <View className={cn('gap-y-3', className)} {...props}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem = React.forwardRef(
  ({ className, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useRadioGroup();
    const isSelected = selectedValue === value;

    return (
      <TouchableOpacity
        ref={ref}
        onPress={() => onValueChange?.(value)}
        className={cn(
          'h-4 w-4 aspect-square items-center justify-center rounded-full border border-primary',
          isSelected && 'border-primary',
          props.disabled && 'opacity-50',
          className,
        )}
        accessibilityState={{ checked: isSelected, disabled: props.disabled }}
        {...props}
      >
        {isSelected && (
          <View className="flex items-center justify-center">
            <Circle size={8} className="text-primary fill-current" />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
