import React from 'react';
import { View, Modal, Pressable, Dimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { cn } from '../../lib/utils';

// --- Context for State Management ---
const PopoverContext = React.createContext(null);

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('usePopover must be used within a <Popover>');
  }
  return context;
};

// --- Main Components ---
const Popover = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [position, setPosition] = React.useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = React.useRef(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange : setInternalOpen;

  const value = { open, setOpen, position, setPosition, triggerRef };

  return (
    <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
  );
};

// --- Trigger Component ---
const PopoverTrigger = ({ children, asChild = false }) => {
  const { setOpen, setPosition, triggerRef, open } = usePopover();

  const handlePress = () => {
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      setPosition({ x: px, y: py, width, height });
      setOpen(!open);
    });
  };

  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      ref: triggerRef,
      onPress: handlePress,
    });
  }

  return (
    <Pressable ref={triggerRef} onPress={handlePress}>
      {children}
    </Pressable>
  );
};

// --- Content (The Popover Itself) ---
const PopoverContent = ({ className, children, ...props }) => {
  const { open, setOpen, position } = usePopover();
  const [contentLayout, setContentLayout] = React.useState({
    width: 0,
    height: 0,
  });
  const { width: screenWidth } = Dimensions.get('window');

  // Adjust position to keep the popover on screen
  let adjustedLeft = position.x;
  if (adjustedLeft + contentLayout.width > screenWidth - 16) {
    adjustedLeft = screenWidth - contentLayout.width - 16;
  }
  if (adjustedLeft < 16) {
    adjustedLeft = 16;
  }

  if (!open) return null;

  return (
    <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
      <Pressable className="flex-1" onPress={() => setOpen(false)}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          onLayout={event => setContentLayout(event.nativeEvent.layout)}
          style={{
            top: position.y + position.height + 8, // Position below the trigger with an offset
            left: adjustedLeft,
          }}
          className={cn(
            'absolute w-72 rounded-md border border-border bg-popover p-4 shadow-lg',
            className,
          )}
          {...props}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
