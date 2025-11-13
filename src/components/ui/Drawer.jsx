import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { cn } from '../../lib/utils';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Context for State Management ---
const DrawerContext = React.createContext(null);

const useDrawer = () => {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error('useDrawer must be used within a <Drawer>');
  return context;
};

// --- Main Components ---
const Drawer = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange : setInternalOpen;
  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

const DrawerTrigger = ({ children }) => {
  const { setOpen } = useDrawer();
  return (
    <TouchableOpacity onPress={() => setOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

const DrawerClose = ({ children }) => {
  const { setOpen } = useDrawer();
  return (
    <TouchableOpacity onPress={() => setOpen(false)}>
      {children}
    </TouchableOpacity>
  );
};

const DrawerContent = ({ className, children, ...props }) => {
  const { open, setOpen } = useDrawer();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate(event => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, 0); // Prevent dragging up
    })
    .onEnd(() => {
      if (translateY.value > SCREEN_HEIGHT / 4) {
        translateY.value = withTiming(SCREEN_HEIGHT, {}, () =>
          runOnJS(setOpen)(false),
        );
      } else {
        translateY.value = withSpring(0);
      }
    });

  React.useEffect(() => {
    if (open) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT);
    }
  }, [open]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!open) return null;

  return (
    <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
      <Pressable onPress={() => setOpen(false)} className="flex-1 bg-black/50">
        <Pressable className="absolute bottom-0 left-0 right-0">
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={animatedStyle}
              className={cn(
                'bg-background rounded-t-lg border-t border-border p-4',
                className,
              )}
              {...props}
            >
              <View className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
              {children}
            </Animated.View>
          </GestureDetector>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- Structural Components ---
const DrawerHeader = ({ className, ...props }) => (
  <View
    className={cn('flex flex-col gap-y-1.5 text-center', className)}
    {...props}
  />
);

const DrawerFooter = ({ className, ...props }) => (
  <View className={cn('mt-auto flex flex-col gap-2', className)} {...props} />
);

const DrawerTitle = ({ className, ...props }) => (
  <Text
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
);

const DrawerDescription = ({ className, ...props }) => (
  <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
