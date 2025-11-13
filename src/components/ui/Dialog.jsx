import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils';

// --- Context for State Management ---
const DialogContext = React.createContext(null);

const useDialog = () => {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a <Dialog>');
  }
  return context;
};

// --- Main Components ---
const Dialog = ({ open: controlledOpen, onOpenChange, children }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOpen !== undefined ? onOpenChange : setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({ children }) => {
  const { setOpen } = useDialog();
  return (
    <TouchableOpacity onPress={() => setOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

const DialogContent = ({ className, children, ...props }) => {
  const { open, setOpen } = useDialog();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    if (open) {
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      scale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
      scale.value = withTiming(0.95, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [open]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  if (!open) {
    return null;
  }

  return (
    <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
      {/* Overlay */}
      <Pressable
        onPress={() => setOpen(false)}
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        {/* Content container that prevents closing on tap */}
        <Pressable>
          <Animated.View
            style={animatedStyle}
            className={cn(
              'w-full max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
              className,
            )}
            {...props}
          >
            {children}
            <DialogClose />
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const DialogClose = ({ className, ...props }) => {
  const { setOpen } = useDialog();
  return (
    <TouchableOpacity
      onPress={() => setOpen(false)}
      className={cn(
        'absolute top-4 right-4 h-6 w-6 items-center justify-center rounded-sm opacity-70 active:opacity-100',
        className,
      )}
      {...props}
    >
      <X size={16} className="text-muted-foreground" />
    </TouchableOpacity>
  );
};

const DialogHeader = ({ className, ...props }) => (
  <View
    className={cn(
      'flex flex-col gap-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }) => (
  <View
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end gap-2',
      className,
    )}
    {...props}
  />
);

const DialogTitle = ({ className, ...props }) => (
  <Text
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-foreground',
      className,
    )}
    {...props}
  />
);

const DialogDescription = ({ className, ...props }) => (
  <Text className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
