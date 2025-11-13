import React from 'react';
import { View } from 'react-native';
import { GripVertical } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// --- Context to share state between components ---
const ResizableContext = React.createContext(null);

// --- Main Components ---
const ResizablePanelGroup = ({
  children,
  className,
  direction = 'horizontal',
  ...props
}) => {
  const [containerSize, setContainerSize] = React.useState(0);
  // position of the handle, as an offset from the start
  const position = useSharedValue(0);
  const context = useSharedValue({ start: 0 });

  // Set initial position to 50%
  React.useEffect(() => {
    if (containerSize > 0 && position.value === 0) {
      position.value = containerSize / 2;
    }
  }, [containerSize, position]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { start: position.value };
    })
    .onUpdate(event => {
      const newPosition =
        direction === 'horizontal'
          ? event.translationX + context.value.start
          : event.translationY + context.value.start;
      // Clamp the position to be within the container bounds
      position.value = Math.max(0, Math.min(newPosition, containerSize));
    });

  const value = { direction, position, containerSize, gesture };

  return (
    <ResizableContext.Provider value={value}>
      <View
        onLayout={event => {
          const size =
            direction === 'horizontal'
              ? event.nativeEvent.layout.width
              : event.nativeEvent.layout.height;
          setContainerSize(size);
        }}
        className={cn(
          'flex-1 w-full',
          direction === 'horizontal' ? 'flex-row' : 'flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </View>
    </ResizableContext.Provider>
  );
};

const ResizablePanel = ({ children, className }) => {
  const { direction, position, containerSize } =
    React.useContext(ResizableContext);
  const panelRef = React.useRef(null);

  // This is a trick to find out if this is the first or second panel
  const [order, setOrder] = React.useState(null);
  React.useEffect(() => {
    if (panelRef.current) {
      // A simple way to determine order based on relative position.
      // Assumes panels don't overlap initially.
      panelRef.current.measure((x, y) => {
        setOrder(x === 0 && y === 0 ? 'first' : 'second');
      });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    if (order === 'first') {
      return direction === 'horizontal'
        ? { width: position.value }
        : { height: position.value };
    } else if (order === 'second') {
      return direction === 'horizontal'
        ? { width: containerSize - position.value }
        : { height: containerSize - position.value };
    }
    // Default to flex-1 before order is determined
    return { flex: 1 };
  });

  return (
    <Animated.View
      ref={panelRef}
      style={animatedStyle}
      className={cn('overflow-hidden', className)}
    >
      {children}
    </Animated.View>
  );
};

const ResizableHandle = ({ withHandle = false, className }) => {
  const { direction, gesture } = React.useContext(ResizableContext);
  return (
    <GestureDetector gesture={gesture}>
      <View
        className={cn(
          'items-center justify-center bg-border',
          direction === 'horizontal' ? 'w-px px-2' : 'h-px py-2',
          className,
        )}
      >
        {withHandle && (
          <View className="z-10 h-4 w-3 items-center justify-center rounded-sm border border-border bg-background">
            <GripVertical size={10} className="text-muted-foreground" />
          </View>
        )}
      </View>
    </GestureDetector>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
