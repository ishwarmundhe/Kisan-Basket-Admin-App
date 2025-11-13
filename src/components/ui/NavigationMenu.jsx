import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { cva } from 'class-variance-authority';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';

const navigationMenuTriggerStyle = cva(
  'group flex-row h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 active:bg-accent',
);

// --- Context for the entire Navigation Menu ---
const NavigationMenuContext = React.createContext(null);

// --- Context for a single Item within the Menu ---
const NavigationMenuItemContext = React.createContext(null);

const useNavigationMenuItem = () => {
  const context = React.useContext(NavigationMenuItemContext);
  if (!context)
    throw new Error(
      'useNavigationMenuItem must be used within a <NavigationMenuItem>',
    );
  return context;
};

// --- Main Components ---
const NavigationMenu = ({ className, children, ...props }) => {
  const [activeMenu, setActiveMenu] = React.useState(null);
  const value = { activeMenu, setActiveMenu };

  return (
    <NavigationMenuContext.Provider value={value}>
      <View
        className={cn(
          'relative flex-row flex-1 items-center justify-center',
          className,
        )}
        {...props}
      >
        {children}
      </View>
    </NavigationMenuContext.Provider>
  );
};

const NavigationMenuList = ({ className, ...props }) => (
  <View
    className={cn('flex-row items-center justify-center gap-x-1', className)}
    {...props}
  />
);

const NavigationMenuItem = ({ value, children }) => {
  const { activeMenu, setActiveMenu } = React.useContext(NavigationMenuContext);
  const triggerRef = React.useRef(null);
  const [position, setPosition] = React.useState({ x: 0, y: 0, width: 0 });

  const isOpen = activeMenu === value;
  const contextValue = {
    isOpen,
    setIsOpen: open => setActiveMenu(open ? value : null),
    position,
    setPosition,
    triggerRef,
  };

  return (
    <NavigationMenuItemContext.Provider value={contextValue}>
      <View>{children}</View>
    </NavigationMenuItemContext.Provider>
  );
};

const NavigationMenuTrigger = ({ children, className }) => {
  const { isOpen, setIsOpen, setPosition, triggerRef } =
    useNavigationMenuItem();
  const rotation = useSharedValue(isOpen ? 180 : 0);

  const handlePress = () => {
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      setPosition({ x: px, y: py + height, width });
      setIsOpen(!isOpen);
    });
  };

  React.useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, { duration: 200 });
  }, [isOpen]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <TouchableOpacity
      ref={triggerRef}
      onPress={handlePress}
      className={cn(
        navigationMenuTriggerStyle(),
        isOpen && 'bg-accent/50',
        className,
      )}
    >
      <Text className="text-sm font-medium text-foreground">{children}</Text>
      <Animated.View style={animatedIconStyle} className="ml-1">
        <ChevronDown size={14} className="text-foreground" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const NavigationMenuContent = ({ className, children }) => {
  const { isOpen, setIsOpen, position } = useNavigationMenuItem();
  if (!isOpen) return null;

  return (
    <Modal
      statusBarTranslucent
      visible={isOpen}
      transparent
      onRequestClose={() => setIsOpen(false)}
    >
      <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
        <View
          style={{ top: position.y, left: position.x }}
          className={cn(
            'absolute w-auto min-w-[12rem] mt-1.5 rounded-md border border-border bg-popover shadow-lg p-2',
            className,
          )}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
};

const NavigationMenuLink = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      className={cn('p-3 rounded-md active:bg-accent', className)}
      {...props}
    >
      {children}
    </TouchableOpacity>
  ),
);

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
};
