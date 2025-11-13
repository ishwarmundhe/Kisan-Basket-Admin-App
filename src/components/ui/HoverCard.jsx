import React from 'react';
import { View, Modal, Pressable, Dimensions } from 'react-native';
import { cn } from '../../lib/utils';

// --- Context for State Management ---
const HoverCardContext = React.createContext(null);

const useHoverCard = () => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error('useHoverCard must be used within a <HoverCard>');
  }
  return context;
};

// --- Main Components ---
const HoverCard = ({ children }) => {
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
    <HoverCardContext.Provider value={value}>
      {children}
    </HoverCardContext.Provider>
  );
};

// --- Trigger Component ---
const HoverCardTrigger = ({ children }) => {
  const { setIsOpen, setPosition, triggerRef } = useHoverCard();

  const handleLongPress = () => {
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      // Position the card above the trigger by default
      setPosition({ x: px, y: py, width, height });
      setIsOpen(true);
    });
  };

  return (
    <Pressable ref={triggerRef} onLongPress={handleLongPress}>
      {children}
    </Pressable>
  );
};

// --- Content (The Popover Card) ---
const HoverCardContent = ({ className, children, ...props }) => {
  const { isOpen, setIsOpen, position } = useHoverCard();
  const cardRef = React.useRef(null);
  const [cardLayout, setCardLayout] = React.useState({ width: 0, height: 0 });

  const { width: screenWidth } = Dimensions.get('window');

  // Adjust position to keep the card on screen
  const adjustedPosition = {
    // Position above the trigger, subtracting card height
    top: position.y - cardLayout.height - 10, // 10 for offset
    // Center the card horizontally relative to the trigger
    left: position.x + position.width / 2 - cardLayout.width / 2,
  };

  // Clamp the left position to avoid going off-screen
  if (adjustedPosition.left < 10) {
    adjustedPosition.left = 10;
  }
  if (adjustedPosition.left + cardLayout.width > screenWidth - 10) {
    adjustedPosition.left = screenWidth - cardLayout.width - 10;
  }

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent onRequestClose={() => setIsOpen(false)}>
      <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
        <View
          ref={cardRef}
          onLayout={event => {
            if (!cardLayout.width) {
              // Measure only once
              setCardLayout(event.nativeEvent.layout);
            }
          }}
          style={adjustedPosition}
          className={cn(
            'absolute w-64 rounded-md border border-border bg-popover p-4 shadow-lg',
            className,
          )}
          {...props}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
};

export { HoverCard, HoverCardTrigger, HoverCardContent };
