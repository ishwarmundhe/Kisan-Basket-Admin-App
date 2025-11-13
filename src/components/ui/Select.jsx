import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { Drawer, DrawerContent } from './Drawer'; // We reuse our Drawer

// --- Context for State Management ---
const SelectContext = React.createContext(null);

const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('useSelect must be used within a <Select>');
  return context;
};

// --- Main Components ---
const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [displayLabel, setDisplayLabel] = React.useState(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const setValue = isControlled ? onValueChange : setInternalValue;

  const contextValue = {
    isOpen,
    setIsOpen,
    value: currentValue,
    onValueChange: setValue,
    displayLabel,
    setDisplayLabel,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Drawer>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className }) => {
  const { setIsOpen } = useSelect();
  return (
    <TouchableOpacity
      onPress={() => setIsOpen(true)}
      className={cn(
        'h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2',
        className,
      )}
    >
      {children}
    </TouchableOpacity>
  );
};

const SelectValue = ({ placeholder }) => {
  const { displayLabel } = useSelect();
  return (
    <Text className={cn('text-sm', !displayLabel && 'text-muted-foreground')}>
      {displayLabel || placeholder || 'Select an option...'}
    </Text>
  );
};

const SelectContent = ({ children, ...props }) => {
  return <DrawerContent {...props}>{children}</DrawerContent>;
};

const SelectItem = ({ label, value, children }) => {
  const {
    value: selectedValue,
    onValueChange,
    setIsOpen,
    setDisplayLabel,
  } = useSelect();
  const isSelected = selectedValue === value;

  // Set initial display label
  React.useEffect(() => {
    if (isSelected) {
      setDisplayLabel(label);
    }
  }, [isSelected, label, setDisplayLabel]);

  const handlePress = () => {
    onValueChange(value);
    setDisplayLabel(label);
    setIsOpen(false);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center justify-between p-3"
    >
      <Text className="text-foreground">{label || children}</Text>
      {isSelected && <Check size={16} className="text-primary" />}
    </TouchableOpacity>
  );
};

const SelectLabel = ({ className, ...props }) => (
  <Text
    className={cn('px-3 py-2 text-sm font-semibold text-foreground', className)}
    {...props}
  />
);

const SelectSeparator = ({ className }) => (
  <View className={cn('h-px bg-border my-1', className)} />
);

// Group is just a View for layout
const SelectGroup = props => <View {...props} />;

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
};
