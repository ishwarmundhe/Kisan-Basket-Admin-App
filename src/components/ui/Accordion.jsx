import React, { useState, useContext, createContext, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  measure,
  useAnimatedRef,
  runOnUI,
} from "react-native-reanimated";
import { cn } from "../../lib/utils";
import { AnimatedView } from "react-native-reanimated/lib/typescript/component/View";

const AccordionContext = createContext(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("useAccordion must be used within an <Accordion>");
  }
  return context;
};

const AccordionItemContext = createContext(null);

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error("useAccordionItem must be used within an <AccordionItem>");
  }
  return context;
};

// --- Accordion Components ---

// Root Component
const Accordion = ({
  value: controlledValue,
  onValueChange,
  type = "single",
  defaultValue,
  children,
  className,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue =
    controlledValue !== undefined && onValueChange
      ? onValueChange
      : setInternalValue;

  return (
    <AccordionContext.Provider value={{ value, setValue, type }}>
      <View className={cn(className)} {...props}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
};

// Item Component
const AccordionItem = ({ value, children, className, ...props }) => {
  const { value: activeValue } = useAccordion();
  const isActive = activeValue === value;

  return (
    <AccordionItemContext.Provider value={{ value, isActive }}>
      <View
        className={cn("border-b border-border last:border-b-0", className)}
        {...props}
      >
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
};

// Trigger Component
const AccordionTrigger = ({ children, className, ...props }) => {
  const { setValue, value: activeValue } = useAccordion();
  const { value, isActive } = useAccordionItem();

  const rotation = useSharedValue(isActive ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isActive ? 180 : 0, { duration: 200 });
  }, [isActive, rotation]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const handlePress = () => {
    if (isActive) {
      setValue(null); // Close if already active
    } else {
      setValue(value); // Open this item
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={cn(
        "flex flex-row flex-1 items-center justify-between py-4",
        className
      )}
      {...props}
    >
      <Text className="text-sm font-medium text-foreground">{children}</Text>
      <AnimatedView style={animatedIconStyle}>
        <ChevronDown size={16} className="text-muted-foreground" />
      </AnimatedView>
    </TouchableOpacity>
  );
};

// Content Component
const AccordionContent = ({ children, className, ...props }) => {
  const { isActive } = useAccordionItem();
  const animatedRef = useAnimatedRef();
  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      opacity: height.value === 0 ? 0 : 1,
      overflow: "hidden",
    };
  });

  const contentContainerStyle = cn("pt-0 pb-4", className);

  return (
    <AnimatedView style={animatedStyle} {...props}>
      <AnimatedView
        ref={animatedRef}
        className={contentContainerStyle}
        onLayout={() => {
          runOnUI(() => {
            "worklet";
            const measuredHeight = measure(animatedRef)?.height ?? 0;
            height.value = withTiming(isActive ? measuredHeight : 0, {
              duration: 200,
            });
          })();
        }}
      >
        {children}
      </AnimatedView>
    </AnimatedView>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
