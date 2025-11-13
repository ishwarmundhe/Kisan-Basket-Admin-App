import React from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';

const Skeleton = React.forwardRef(({ className, ...props }, ref) => {
  const opacity = useSharedValue(1);

  // Create a pulsing animation
  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true, // Reverse the animation
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      ref={ref}
      style={animatedStyle}
      className={cn('rounded-md bg-accent', className)}
      {...props}
    />
  );
});
Skeleton.displayName = 'Skeleton';

export { Skeleton };
