import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { PanelLeft } from 'lucide-react-native';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Sheet, SheetContent } from './Sheet';
import { Button } from './Button';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

// --- Configuration ---
const TABLET_BREAKPOINT = 768;
const SIDEBAR_WIDTH_EXPANDED = 256;
const SIDEBAR_WIDTH_COLLAPSED = 64;

// --- Context for State Management ---
const SidebarContext = React.createContext(null);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context)
    throw new Error('useSidebar must be used within a <SidebarProvider>');
  return context;
};

// --- Main Provider Component ---
const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  const { width } = Dimensions.get('window');
  const isMobile = width < TABLET_BREAKPOINT;

  const toggle = () => {
    if (isMobile) {
      setIsMobileSheetOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  const value = {
    isCollapsed,
    toggle,
    isMobile,
    isMobileSheetOpen,
    setIsMobileSheetOpen,
  };

  return (
    <SidebarContext.Provider value={value}>
      <View className="flex-1 flex-row bg-background">{children}</View>
    </SidebarContext.Provider>
  );
};

// --- Sidebar Container ---
const Sidebar = ({ className, children, ...props }) => {
  const { isCollapsed, isMobile, isMobileSheetOpen, setIsMobileSheetOpen } =
    useSidebar();
  const width = useSharedValue(
    isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
  );

  React.useEffect(() => {
    width.value = withTiming(
      isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
      { duration: 200 },
    );
  }, [isCollapsed]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  if (isMobile) {
    return (
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent side="left" className="w-3/4 bg-sidebar p-0">
          <View className="flex-1" {...props}>
            {children}
          </View>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Animated.View
      style={animatedStyle}
      className={cn('bg-sidebar border-r border-sidebar-border', className)}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// --- Other Components ---
const SidebarTrigger = ({ className, ...props }) => {
  const { toggle } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={toggle}
      className={cn('h-8 w-8', className)}
      {...props}
    >
      <PanelLeft size={18} className="text-foreground" />
    </Button>
  );
};

const SidebarHeader = props => <View className="p-2" {...props} />;
const SidebarContent = props => <ScrollView className="flex-1" {...props} />;
const SidebarFooter = props => (
  <View className="p-2 border-t border-sidebar-border" {...props} />
);

// --- Menu Components ---
const sidebarMenuButtonVariants = cva(
  'flex-row items-center gap-x-2 rounded-md p-2 text-left',
  {
    variants: {
      isActive: {
        true: 'bg-sidebar-accent',
        false: 'active:bg-sidebar-accent',
      },
    },
  },
);

const SidebarMenuButton = ({ className, isActive, children, ...props }) => {
  const { isCollapsed } = useSidebar();
  return (
    <TouchableOpacity
      className={cn(
        sidebarMenuButtonVariants({ isActive }),
        isCollapsed && 'w-10 justify-center',
        className,
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (isCollapsed && child?.type !== Text) {
          return child;
        }
        if (!isCollapsed) {
          return child;
        }
        return null;
      })}
    </TouchableOpacity>
  );
};

const SidebarInset = props => <View className="flex-1" {...props} />;

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarInset,
};
