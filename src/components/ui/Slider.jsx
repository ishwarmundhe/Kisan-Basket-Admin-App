import React from 'react';
import SliderPrimitive from '@react--native-community/slider';
import { cn } from '../../lib/utils';
import { colors } from '../../config/theme'; // 1. Import colors from your central theme file

const Slider = React.forwardRef(
  ({ className, value, onValueChange, ...props }, ref) => {
    // The native slider expects a single number for its value.
    // If the incoming value is an array, we take the first value.
    const displayValue = Array.isArray(value) ? value[0] : value;

    return (
      // 2. Use SliderPrimitive directly
      <SliderPrimitive
        ref={ref}
        value={displayValue}
        onValueChange={onValueChange}
        // Map props
        minimumValue={props.min || 0}
        maximumValue={props.max || 100}
        step={props.step || 1}
        // Style the slider using colors from your theme
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.muted}
        thumbTintColor={colors.primary}
        // Note: `className` has limited effect on this component, `style` is preferred for layout
        style={[{ width: '100%', height: 40 }, props.style]}
        {...props}
      />
    );
  },
);
Slider.displayName = 'Slider';

export { Slider };
