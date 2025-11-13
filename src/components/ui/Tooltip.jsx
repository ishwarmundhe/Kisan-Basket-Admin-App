import React from 'react';
import { View, Text, Modal, Pressable, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// --- Styled Components ---

// --- Context for State Management ---
const TooltipContext = React.createContext(null);

// TooltipProvider is optional in this native setup, but included for API consistency.
const TooltipProvider = ({ children }) => <>{children}</>;

// --- Main Components ---
const Tooltip = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = React.useRef(null);

  const value = { isOpen, setIsOpen, position, setPosition, triggerRef };

  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
};

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error('useTooltip must be used within a <Tooltip>');
  return context;
};

// --- Trigger Component ---
const TooltipTrigger = ({ children, asChild = false }) => {
  const { setIsOpen, setPosition, triggerRef } = useTooltip();

  const handleLongPress = () => {
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      setPosition({ x: px, y: py, width, height });
      setIsOpen(true);
    });
  };

  const handlePressOut = () => {
    setIsOpen(false);
  };

  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      ref: triggerRef,
      onLongPress: handleLongPress,
      onPressOut: handlePressOut,
    });
  }

  return (
    <Pressable
      ref={triggerRef}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
    >
      {children}
    </Pressable>
  );
};

// --- Content (The Tooltip Bubble) ---
const TooltipContent = ({ className, children, ...props }) => {
  const { isOpen, setIsOpen, position } = useTooltip();
  const [contentLayout, setContentLayout] = React.useState({
    width: 0,
    height: 0,
  });
  const { width: screenWidth } = Dimensions.get('window');

  // Position the tooltip above the trigger
  const adjustedPosition = {
    top: position.y - contentLayout.height - 8, // 8 for offset
    left: position.x + position.width / 2 - contentLayout.width / 2,
  };

  // Clamp position to stay within screen bounds
  if (adjustedPosition.left < 16) adjustedPosition.left = 16;
  if (adjustedPosition.left + contentLayout.width > screenWidth - 16) {
    adjustedPosition.left = screenWidth - contentLayout.width - 16;
  }

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent onRequestClose={() => setIsOpen(false)}>
      <View className="flex-1" onTouchEnd={() => setIsOpen(false)}>
        <View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          onLayout={event => setContentLayout(event.nativeEvent.layout)}
          style={adjustedPosition}
          className={cn(
            'absolute rounded-md bg-primary px-3 py-1.5 shadow-lg',
            className,
          )}
          {...props}
        >
          <Text className="text-[8px] font-semibold text-primary-foreground">
            {children}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
