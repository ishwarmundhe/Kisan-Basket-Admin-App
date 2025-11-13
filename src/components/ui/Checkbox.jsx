import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '../../lib/utils'; // Adjust path

const Checkbox = React.forwardRef(
  (
    {
      className,
      checked: controlledChecked,
      onCheckedChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalChecked, setInternalChecked] = React.useState(
      props.defaultChecked || false,
    );

    // Determine if the checkbox is controlled or uncontrolled
    const isChecked =
      controlledChecked !== undefined ? controlledChecked : internalChecked;

    const handlePress = () => {
      if (disabled) return;
      const newCheckedState = !isChecked;
      // If uncontrolled, update internal state
      if (controlledChecked === undefined) {
        setInternalChecked(newCheckedState);
      }
      // Notify parent component of the change
      onCheckedChange?.(newCheckedState);
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        className={cn(
          'h-4 w-4 shrink-0 items-center justify-center rounded-sm border shadow-sm',
          // Apply styles based on state
          isChecked
            ? 'border-primary bg-primary'
            : 'border-border bg-background',
          disabled && 'opacity-50',
          className,
        )}
        accessibilityState={{ checked: isChecked, disabled }}
        {...props}
      >
        {isChecked && <Check size={12} className="text-primary-foreground" />}
      </TouchableOpacity>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
