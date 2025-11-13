import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';

// --- Context for State Management ---
const TabsContext = React.createContext(null);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used within a <Tabs>');
  return context;
};

// --- Main Components ---
const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const setValue = isControlled ? onValueChange : setInternalValue;

  const contextValue = { value, setValue };

  return (
    <TabsContext.Provider value={contextValue}>
      <View className={cn('gap-y-2', className)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children }) => {
  const [layouts, setLayouts] = React.useState([]);
  const { value: activeTab } = useTabs();

  const indicatorLeft = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  React.useEffect(() => {
    const activeLayout = layouts.find(layout => layout.key === activeTab);
    if (activeLayout) {
      indicatorLeft.value = withTiming(activeLayout.x);
      indicatorWidth.value = withTiming(activeLayout.width);
    }
  }, [activeTab, layouts]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: indicatorLeft.value,
    width: indicatorWidth.value,
  }));

  return (
    <View
      className={cn(
        'relative flex-row h-9 w-fit items-center justify-center rounded-lg bg-muted p-1',
        className,
      )}
    >
      <Animated.View
        className="absolute h-[calc(100%-8px)] rounded-md bg-card shadow-sm"
        style={animatedIndicatorStyle}
      />
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          onLayout: event => {
            const { x, width } = event.nativeEvent.layout;
            setLayouts(prev => {
              // Avoid duplicates
              if (prev.find(l => l.key === child.props.value)) return prev;
              return [...prev, { key: child.props.value, x, width }];
            });
          },
        }),
      )}
    </View>
  );
};

const TabsTrigger = ({ value, children, className, onLayout, ...props }) => {
  const { value: activeTab, setValue } = useTabs();
  const isActive = activeTab === value;

  return (
    <TouchableOpacity
      onPress={() => setValue(value)}
      onLayout={onLayout}
      className={cn(
        'relative flex-1 items-center justify-center rounded-md px-3 py-1.5',
        className,
      )}
      accessibilityState={{ selected: isActive }}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          className={cn(
            'text-sm font-medium',
            isActive ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const TabsContent = ({ value, children, ...props }) => {
  const { value: activeTab } = useTabs();
  const isSelected = activeTab === value;

  if (!isSelected) return null;

  return (
    <View className="flex-1" {...props}>
      {children}
    </View>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
