import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { cn } from '../../lib/utils';

// --- Context for State Management ---
const DropdownMenuContext = React.createContext(null);

const useDropdownMenu = () => {
  const context = React.useContext(DropdownMenuContext);
  if (!context)
    throw new Error('useDropdownMenu must be used within a <DropdownMenu>');
  return context;
};

// --- Main Components ---
const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0, width: 0 });
  const triggerRef = React.useRef(null);

  const value = { isOpen, setIsOpen, position, setPosition, triggerRef };

  return (
    <DropdownMenuContext.Provider value={value}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

// --- Trigger Component ---
const DropdownMenuTrigger = ({ children }) => {
  const { setIsOpen, setPosition, triggerRef } = useDropdownMenu();

  const handlePress = () => {
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      setPosition({ x: px, y: py + height, width });
      setIsOpen(true);
    });
  };

  return (
    <TouchableOpacity ref={triggerRef} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};

// --- Content (The Menu Itself) ---
const DropdownMenuContent = ({ className, children, ...props }) => {
  const { isOpen, setIsOpen, position } = useDropdownMenu();

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
          style={{ top: position.y, left: position.x, width: position.width }}
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
const DropdownMenuItem = ({
  className,
  children,
  onSelect,
  inset,
  ...props
}) => {
  const { setIsOpen } = useDropdownMenu();
  return (
    <TouchableOpacity
      onPress={() => {
        onSelect?.();
        setIsOpen(false);
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
const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  onCheckedChange,
}) => (
  <DropdownMenuItem
    onSelect={() => onCheckedChange?.(!checked)}
    className={cn('pl-8', className)}
  >
    <View className="absolute left-2 h-full justify-center">
      {checked && <Check size={16} className="text-foreground" />}
    </View>
    {children}
  </DropdownMenuItem>
);

// --- Radio Group ---
const DropdownMenuRadioGroupContext = React.createContext(null);

const DropdownMenuRadioGroup = ({ value, onValueChange, children }) => (
  <DropdownMenuRadioGroupContext.Provider value={{ value, onValueChange }}>
    {children}
  </DropdownMenuRadioGroupContext.Provider>
);

const DropdownMenuRadioItem = ({ value, className, children }) => {
  const context = React.useContext(DropdownMenuRadioGroupContext);
  const isSelected = context.value === value;
  return (
    <DropdownMenuItem
      onSelect={() => context.onValueChange?.(value)}
      className={cn('pl-8', className)}
    >
      <View className="absolute left-2 h-full justify-center">
        {isSelected && (
          <Circle size={8} className="text-foreground fill-current" />
        )}
      </View>
      {children}
    </DropdownMenuItem>
  );
};

// --- Other Components ---
const DropdownMenuLabel = ({ className, inset, ...props }) => (
  <Text
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const DropdownMenuSeparator = ({ className }) => (
  <View className={cn('h-px my-1 bg-border', className)} />
);

const DropdownMenuShortcut = ({ className, ...props }) => (
  <Text
    className={cn(
      'ml-auto text-[8px] tracking-widest text-muted-foreground',
      className,
    )}
    {...props}
  />
);

const DropdownMenuGroup = props => <View {...props} />;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
};
