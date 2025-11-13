import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  const progress = useSharedValue(value);

  // Animate the width of the indicator when the value prop changes
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  // Update the shared value when the `value` prop changes
  React.useEffect(() => {
    progress.value = withTiming(value, { duration: 500 });
  }, [value, progress]);

  return (
    <View
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
        className,
      )}
      {...props}
    >
      <Animated.View
        className="h-full w-full flex-1 bg-primary"
        style={animatedStyle}
      />
    </View>
  );
});
Progress.displayName = 'Progress';

export { Progress };
