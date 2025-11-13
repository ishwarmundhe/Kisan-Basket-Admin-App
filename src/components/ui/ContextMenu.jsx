import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { cn } from '../../lib/utils';

// --- Main Context for Menu State ---
const ContextMenuContext = React.createContext(null);

const useContextMenu = () => {
  const context = React.useContext(ContextMenuContext);
  if (!context)
    throw new Error('useContextMenu must be used within a <ContextMenu>');
  return context;
};

const ContextMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const value = { isOpen, setIsOpen, position, setPosition };

  return (
    <ContextMenuContext.Provider value={value}>
      {children}
    </ContextMenuContext.Provider>
  );
};

// --- Trigger Component ---
const ContextMenuTrigger = ({ children, className }) => {
  const { setIsOpen, setPosition } = useContextMenu();

  const handleLongPress = event => {
    const { pageX, pageY } = event.nativeEvent;
    setPosition({ x: pageX, y: pageY });
    setIsOpen(true);
  };

  return (
    <Pressable onLongPress={handleLongPress} className={className}>
      {children}
    </Pressable>
  );
};

// --- Content (The Menu Itself) ---
const ContextMenuContent = ({ className, children, ...props }) => {
  const { isOpen, setIsOpen, position } = useContextMenu();
  const menuRef = React.useRef(null);
  const [menuLayout, setMenuLayout] = React.useState({ width: 0, height: 0 });

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Adjust position to prevent going off-screen
  const adjustedPosition = {
    top:
      position.y + menuLayout.height > screenHeight
        ? screenHeight - menuLayout.height - 10
        : position.y,
    left:
      position.x + menuLayout.width > screenWidth
        ? screenWidth - menuLayout.width - 10
        : position.x,
  };

  return (
    <Modal visible={isOpen} transparent onRequestClose={() => setIsOpen(false)}>
      <Pressable className="flex-1" onPress={() => setIsOpen(false)}>
        <View
          ref={menuRef}
          onLayout={event => {
            if (!menuLayout.width) {
              setMenuLayout(event.nativeEvent.layout);
            }
          }}
          style={adjustedPosition}
          className={cn(
            'absolute min-w-[12rem] rounded-md border border-border bg-popover p-1 shadow-lg',
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

// --- Menu Item ---
const ContextMenuItem = ({
  className,
  children,
  onSelect,
  inset,
  ...props
}) => {
  const { setIsOpen } = useContextMenu();
  return (
    <TouchableOpacity
      onPress={() => {
        onSelect?.();
        setIsOpen(false); // Close menu on select
      }}
      className={cn(
        'flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent',
        inset && 'pl-8',
        props.disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// --- Checkbox Item ---
const ContextMenuCheckboxItem = ({
  className,
  children,
  checked,
  onCheckedChange,
}) => (
  <ContextMenuItem
    onSelect={() => onCheckedChange?.(!checked)}
    className={cn('pl-8', className)}
  >
    <View className="absolute left-2 h-full justify-center">
      {checked && <Check size={16} className="text-foreground" />}
    </View>
    {children}
  </ContextMenuItem>
);

// --- Radio Group ---
const ContextMenuRadioGroupContext = React.createContext(null);

const ContextMenuRadioGroup = ({ value, onValueChange, children }) => (
  <ContextMenuRadioGroupContext.Provider value={{ value, onValueChange }}>
    {children}
  </ContextMenuRadioGroupContext.Provider>
);

const ContextMenuRadioItem = ({ value, className, children }) => {
  const context = React.useContext(ContextMenuRadioGroupContext);
  const isSelected = context.value === value;
  return (
    <ContextMenuItem
      onSelect={() => context.onValueChange?.(value)}
      className={cn('pl-8', className)}
    >
      <View className="absolute left-2 h-full justify-center">
        {isSelected && (
          <Circle size={8} className="text-foreground fill-current" />
        )}
      </View>
      {children}
    </ContextMenuItem>
  );
};

// --- Other Components ---
const ContextMenuLabel = ({ className, inset, ...props }) => (
  <Text
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const ContextMenuSeparator = ({ className, ...props }) => (
  <View className={cn('h-px my-1 bg-border', className)} {...props} />
);

const ContextMenuShortcut = ({ className, ...props }) => (
  <Text
    className={cn(
      'ml-auto text-[8px] tracking-widest text-muted-foreground',
      className,
    )}
    {...props}
  />
);

const ContextMenuGroup = props => <View {...props} />;

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuRadioGroup,
};
