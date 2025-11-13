import React from 'react';
import { View, Text, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { cn } from '../../lib/utils';

// --- Context for a single Menu within the Menubar ---
const MenubarMenuContext = React.createContext(null);

const useMenubarMenu = () => {
  const context = React.useContext(MenubarMenuContext);
  if (!context)
    throw new Error('useMenubarMenu must be used within a <MenubarMenu>');
  return context;
};

// --- Main Components ---
const Menubar = ({ className, ...props }) => (
  <View
    className={cn(
      'flex-row h-10 items-center rounded-md border border-border bg-background p-1 gap-x-1',
      className,
    )}
    {...props}
  />
);

const MenubarMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0, width: 0 });
  const triggerRef = React.useRef(null);
  const value = { isOpen, setIsOpen, position, setPosition, triggerRef };

  return (
    <MenubarMenuContext.Provider value={value}>
      {children}
    </MenubarMenuContext.Provider>
  );
};

const MenubarTrigger = ({ children }) => {
  const { setIsOpen, setPosition, triggerRef, isOpen } = useMenubarMenu();

  const handlePress = () => {
    triggerRef.current?.measure((fx, fy, width, height, px, py) => {
      setPosition({ x: px, y: py + height, width });
      setIsOpen(!isOpen);
    });
  };

  return (
    <TouchableOpacity
      ref={triggerRef}
      onPress={handlePress}
      className={cn(
        'flex-row items-center justify-center rounded-sm px-3 py-1.5 active:bg-accent',
        isOpen && 'bg-accent',
      )}
    >
      {/* If child is string, wrap in Text */}
      {typeof children === 'string' ? (
        <Text className="text-sm font-medium text-foreground">{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const MenubarContent = ({ className, children, ...props }) => {
  const { isOpen, setIsOpen, position } = useMenubarMenu();
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

const MenubarItem = ({ className, children, onSelect, inset, ...props }) => {
  const { setIsOpen } = useMenubarMenu();
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

const MenubarCheckboxItem = ({
  className,
  children,
  checked,
  onCheckedChange,
}) => (
  <MenubarItem
    onSelect={() => onCheckedChange?.(!checked)}
    className={cn('pl-8', className)}
  >
    <View className="absolute left-2 h-full justify-center">
      {checked && <Check size={16} className="text-foreground" />}
    </View>
    {children}
  </MenubarItem>
);

const MenubarRadioGroupContext = React.createContext(null);

const MenubarRadioGroup = ({ value, onValueChange, children }) => (
  <MenubarRadioGroupContext.Provider value={{ value, onValueChange }}>
    {children}
  </MenubarRadioGroupContext.Provider>
);

const MenubarRadioItem = ({ value, className, children }) => {
  const context = React.useContext(MenubarRadioGroupContext);
  const isSelected = context.value === value;
  return (
    <MenubarItem
      onSelect={() => context.onValueChange?.(value)}
      className={cn('pl-8', className)}
    >
      <View className="absolute left-2 h-full justify-center">
        {isSelected && (
          <Circle size={8} className="text-foreground fill-current" />
        )}
      </View>
      {children}
    </MenubarItem>
  );
};

const MenubarLabel = ({ className, inset, ...props }) => (
  <Text
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

const MenubarSeparator = ({ className }) => (
  <View className={cn('h-px my-1 bg-border', className)} />
);

const MenubarShortcut = ({ className, ...props }) => (
  <Text
    className={cn(
      'ml-auto text-[8px] tracking-widest text-muted-foreground',
      className,
    )}
    {...props}
  />
);

const MenubarGroup = props => <View {...props} />;

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarShortcut,
  MenubarGroup,
};
