import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';
import { colors } from '../../config/theme'; // 1. Import colors from your central theme file

// Create an animated version of Pressable for the track
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Switch = React.forwardRef(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    // A shared value of 0 is 'off', 1 is 'on'
    const progress = useSharedValue(checked ? 1 : 0);

    // Animate the shared value when the `checked` prop changes
    React.useEffect(() => {
      progress.value = withTiming(checked ? 1 : 0, { duration: 200 });
    }, [checked, progress]);

    const handlePress = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };

    const animatedTrackStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        progress.value,
        [0, 1],
        [colors['switch-background'], colors.primary],
      );
      return {
        backgroundColor,
      };
    });

    const animatedThumbStyle = useAnimatedStyle(() => {
      const translateX = withTiming(progress.value === 1 ? 14 : 2, {
        duration: 200,
      });
      return {
        transform: [{ translateX }],
      };
    });

    return (
      // 2. Use the animated components directly
      <AnimatedPressable
        ref={ref}
        onPress={handlePress}
        disabled={disabled}
        style={animatedTrackStyle}
        className={cn(
          'h-[20px] w-8 rounded-full justify-center',
          disabled && 'opacity-50',
          className,
        )}
        accessibilityRole="switch"
        accessibilityState={{ checked, disabled }}
        {...props}
      >
        <Animated.View
          style={animatedThumbStyle}
          className="h-4 w-4 rounded-full bg-card shadow-sm"
        />
      </AnimatedPressable>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
