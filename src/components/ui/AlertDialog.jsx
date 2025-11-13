import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { cn } from '../../lib/utils'; // Assuming you have this utility

// --- Context for State Management ---
const AlertDialogContext = createContext(null);

const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an <AlertDialog>');
  }
  return context;
};

// --- Main Components ---
const AlertDialog = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogTrigger = ({ children }) => {
  const { setOpen } = useAlertDialog();
  return (
    <TouchableOpacity onPress={() => setOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

const AlertDialogContent = ({ className, children, ...props }) => {
  const { open, setOpen } = useAlertDialog();

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
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

  return (
    <Modal
      visible={open}
      transparent={true}
      onRequestClose={() => setOpen(false)}
      statusBarTranslucent
    >
      <Pressable
        onPress={() => setOpen(false)}
        className="flex-1 items-center justify-center bg-black/50 p-4"
      >
        {/* This Pressable prevents the modal from closing when tapping the content */}
        <Pressable>
          <View
            style={animatedStyle}
            className={cn(
              'w-full max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg',
              className,
            )}
            {...props}
          >
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const AlertDialogHeader = ({ className, ...props }) => (
  <View className={cn('flex flex-col gap-2', className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }) => (
  <View
    className={cn(
      'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      className,
    )}
    {...props}
  />
);

const AlertDialogTitle = ({ className, ...props }) => (
  <Text
    className={cn(
      'text-lg font-semibold text-foreground text-center sm:text-left',
      className,
    )}
    {...props}
  />
);

const AlertDialogDescription = ({ className, ...props }) => (
  <Text
    className={cn(
      'text-sm text-muted-foreground text-center sm:text-left',
      className,
    )}
    {...props}
  />
);

// Basic button styles, assuming you might have a `buttonVariants` utility
const buttonBaseClasses = 'rounded-md px-4 py-2 justify-center items-center';
const primaryButtonClasses = 'bg-primary';
const primaryButtonTextClasses = 'text-primary-foreground';
const outlineButtonClasses = 'border border-input bg-transparent';
const outlineButtonTextClasses = 'text-accent-foreground';

const AlertDialogAction = ({
  className,
  textClassName,
  children,
  ...props
}) => {
  const { setOpen } = useAlertDialog();
  return (
    <TouchableOpacity
      onPress={e => {
        props.onPress?.(e);
        setOpen(false);
      }}
      className={cn(buttonBaseClasses, primaryButtonClasses, className)}
      {...props}
    >
      <Text className={cn(primaryButtonTextClasses, textClassName)}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const AlertDialogCancel = ({
  className,
  textClassName,
  children,
  ...props
}) => {
  const { setOpen } = useAlertDialog();
  return (
    <TouchableOpacity
      onPress={() => setOpen(false)}
      className={cn(buttonBaseClasses, outlineButtonClasses, className)}
      {...props}
    >
      <Text className={cn(outlineButtonTextClasses, textClassName)}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// Note: AlertDialogPortal and AlertDialogOverlay are not needed
// because React Native's Modal component handles this behavior.

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
