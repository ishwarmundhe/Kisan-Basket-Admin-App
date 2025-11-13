import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { AlertDialog as Dialog, AlertDialogContent } from './AlertDialog';

// --- Context to manage command state ---
const CommandContext = React.createContext(null);

const useCommand = () => {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within a <Command />');
  }
  return context;
};

// --- Main Command Component ---
const Command = ({ children, className, ...props }) => {
  const [search, setSearch] = React.useState('');
  const [items, setItems] = React.useState([]);

  // Collect all items from children recursively
  React.useEffect(() => {
    const collectedItems = [];
    React.Children.forEach(children, child => {
      if (child.type === CommandList) {
        React.Children.forEach(child.props.children, group => {
          if (group.type === CommandGroup) {
            const groupItems = [];
            React.Children.forEach(group.props.children, item => {
              if (item.type === CommandItem) {
                groupItems.push({
                  ...item.props,
                  group: group.props.heading,
                });
              }
            });
            if (groupItems.length > 0) {
              collectedItems.push({
                heading: group.props.heading,
                items: groupItems,
              });
            }
          }
        });
      }
    });
    setItems(collectedItems);
  }, [children]);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    return items
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.value?.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [items, search]);

  return (
    <CommandContext.Provider value={{ search, setSearch, filteredItems }}>
      <View
        className={cn(
          'flex-1 bg-popover text-popover-foreground rounded-md',
          className,
        )}
        {...props}
      >
        {/* We only render the children that are NOT CommandList */}
        {React.Children.toArray(children).filter(
          child => child.type !== CommandList,
        )}
        {/* Render the list separately with filtered data */}
        {React.Children.toArray(children).find(
          child => child.type === CommandList,
        )}
      </View>
    </CommandContext.Provider>
  );
};

const CommandDialog = ({ children, ...props }) => (
  <Dialog {...props}>
    <AlertDialogContent className="overflow-hidden p-0">
      <Command>{children}</Command>
    </AlertDialogContent>
  </Dialog>
);

const CommandInput = ({ className, ...props }) => {
  const { search, setSearch } = useCommand();
  return (
    <View className="flex-row items-center border-b border-border px-3">
      <Search size={16} className="text-muted-foreground mr-2" />
      <TextInput
        placeholder="Type a command or search..."
        placeholderTextColor="#6b7360" // muted-foreground
        className={cn(
          'h-12 w-full bg-transparent text-foreground text-sm',
          className,
        )}
        value={search}
        onChangeText={setSearch}
        {...props}
      />
    </View>
  );
};

const CommandList = ({ className, ...props }) => {
  const { filteredItems } = useCommand();
  const hasResults = filteredItems.length > 0;

  return hasResults ? (
    <FlatList
      data={filteredItems}
      keyExtractor={item => item.heading}
      renderItem={({ item: group }) => (
        <View>
          {group.heading && (
            <Text className="px-3 py-2 text-[8px] font-medium text-muted-foreground">
              {group.heading}
            </Text>
          )}
          {group.items.map(item => (
            <CommandItem key={item.value} {...item} />
          ))}
        </View>
      )}
      className={cn('flex-1', className)}
      {...props}
    />
  ) : (
    // Find and render CommandEmpty if it exists
    React.Children.toArray(props.children).find(
      child => child.type === CommandEmpty,
    ) || null
  );
};

const CommandEmpty = ({ className, children = 'No results found.' }) => (
  <View className="py-6 items-center justify-center">
    <Text className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Text>
  </View>
);

// These are now declarative components; their data is extracted by the parent Command
const CommandGroup = ({ children }) => <>{children}</>;
const CommandSeparator = ({ className }) => (
  <View className={cn('h-px bg-border my-1', className)} />
);
const CommandShortcut = ({ className, children }) => (
  <Text className={cn('text-[8px] text-muted-foreground', className)}>
    {children}
  </Text>
);

const CommandItem = ({ className, value, onSelect, children, ...props }) => (
  <TouchableOpacity
    onPress={onSelect}
    className={cn(
      'flex-row items-center gap-2 rounded-sm px-3 py-2.5 mx-2 my-0.5 active:bg-accent',
      className,
    )}
    {...props}
  >
    <View className="flex-1 flex-row items-center gap-2">
      {/* Ensure children that are strings are wrapped in Text */}
      {React.Children.map(children, child =>
        typeof child === 'string' ? (
          <Text className="text-sm text-foreground">{child}</Text>
        ) : (
          child
        ),
      )}
    </View>
    {/* Find and render CommandShortcut if it exists */}
    {React.Children.toArray(children).find(
      child => child.type === CommandShortcut,
    )}
  </TouchableOpacity>
);

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
