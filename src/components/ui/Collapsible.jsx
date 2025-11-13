import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  measure,
  useAnimatedRef,
  runOnUI,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';

// --- Context to share collapsible state ---
const CollapsibleContext = React.createContext(null);

const useCollapsible = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a <Collapsible>');
  }
  return context;
};

// --- Collapsible Components ---

const Collapsible = ({
  className,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = () => {
    const newValue = !isOpen;
    if (controlledOpen === undefined) {
      setInternalOpen(newValue);
    }
    onOpenChange?.(newValue);
  };

  return (
    <CollapsibleContext.Provider value={{ isOpen, toggle }}>
      <View className={cn(className)} {...props}>
        {children}
      </View>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleTrigger = ({ children, ...props }) => {
  const { toggle } = useCollapsible();
  return (
    <TouchableOpacity onPress={toggle} {...props}>
      {children}
    </TouchableOpacity>
  );
};

const CollapsibleContent = ({ className, children, ...props }) => {
  const { isOpen } = useCollapsible();
  const animatedRef = useAnimatedRef();
  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(height.value, { duration: 200 }),
      opacity: withTiming(height.value === 0 ? 0 : 1, { duration: 200 }),
      overflow: 'hidden',
    };
  });

  React.useEffect(() => {
    runOnUI(() => {
      'worklet';
      if (isOpen) {
        height.value = measure(animatedRef)?.height || 0;
      } else {
        height.value = 0;
      }
    })();
  }, [isOpen, children]);

  return (
    <Animated.View style={animatedStyle} {...props}>
      <View
        ref={animatedRef}
        className={cn('absolute top-0 w-full', className)} // Positioned absolutely to measure height
      >
        {children}
      </View>
    </Animated.View>
  );
};

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
