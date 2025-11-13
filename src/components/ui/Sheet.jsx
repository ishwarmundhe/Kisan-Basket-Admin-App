import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Context for State Management ---
const SheetContext = React.createContext(null);

// --- Main Components ---
const Sheet = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange : setInternalOpen;
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const useSheet = () => {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error('useSheet must be used within a <Sheet>');
  return context;
};

const SheetTrigger = ({ children }) => {
  const { setOpen } = useSheet();
  return (
    <TouchableOpacity onPress={() => setOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

const SheetClose = ({ children }) => {
  const { setOpen } = useSheet();
  return (
    <TouchableOpacity onPress={() => setOpen(false)}>
      {children}
    </TouchableOpacity>
  );
};

const SheetContent = ({ className, children, side = 'right', ...props }) => {
  const { open, setOpen } = useSheet();
  const offset = useSharedValue(0);

  const isHorizontal = side === 'left' || side === 'right';
  const startPosition = isHorizontal
    ? side === 'left'
      ? -SCREEN_WIDTH
      : SCREEN_WIDTH
    : side === 'top'
    ? -SCREEN_HEIGHT
    : SCREEN_HEIGHT;

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      const trans = isHorizontal ? event.translationX : event.translationY;
      const currentOffset = startPosition === 0 ? trans : offset.value + trans; // More stable gesture

      // Prevent dragging further out of screen
      if (
        (side === 'right' && currentOffset > 0) ||
        (side === 'left' && currentOffset < 0) ||
        (side === 'bottom' && currentOffset > 0) ||
        (side === 'top' && currentOffset < 0)
      ) {
        offset.value = withSpring(currentOffset, {
          damping: 15,
          stiffness: 150,
        });
      }
    })
    .onEnd(() => {
      const threshold = (isHorizontal ? SCREEN_WIDTH : SCREEN_HEIGHT) / 4;
      if (Math.abs(offset.value) > threshold) {
        offset.value = withTiming(startPosition, {}, () =>
          runOnJS(setOpen)(false),
        );
      } else {
        offset.value = withSpring(0);
      }
    });

  React.useEffect(() => {
    offset.value = open
      ? withSpring(0, { damping: 15, stiffness: 150 })
      : withTiming(startPosition);
  }, [open]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: isHorizontal
      ? [{ translateX: offset.value }]
      : [{ translateY: offset.value }],
  }));

  const sideClasses = {
    top: 'top-0 left-0 right-0 border-b',
    bottom: 'bottom-0 left-0 right-0 border-t',
    left: 'left-0 top-0 bottom-0 h-full w-3/4 border-r',
    right: 'right-0 top-0 bottom-0 h-full w-3/4 border-l',
  };

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      onRequestClose={() => setOpen(false)}
    >
      <Pressable onPress={() => setOpen(false)} className="flex-1 bg-black/50">
        <GestureDetector gesture={gesture}>
          {/* Added a Pressable wrapper to prevent taps inside the sheet from closing it */}
          <Pressable>
            <Animated.View
              style={animatedStyle}
              className={cn(
                'absolute bg-background p-4 shadow-lg',
                sideClasses[side],
                className,
              )}
              {...props}
            >
              {children}
              <SheetClose>
                <View className="absolute top-4 right-4 h-6 w-6 items-center justify-center rounded-sm opacity-70 active:opacity-100">
                  <X size={16} className="text-muted-foreground" />
                </View>
              </SheetClose>
            </Animated.View>
          </Pressable>
        </GestureDetector>
      </Pressable>
    </Modal>
  );
};

// --- Structural Components ---
const SheetHeader = ({ className, ...props }) => (
  <View
    className={cn('flex flex-col gap-y-1.5 text-left', className)}
    {...props}
  />
);

const SheetFooter = ({ className, ...props }) => (
  <View className={cn('mt-auto flex flex-col gap-2', className)} {...props} />
);

const SheetTitle = ({ className, ...props }) => (
  <Text
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
);

const SheetDescription = ({ className, ...props }) => (
  <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
