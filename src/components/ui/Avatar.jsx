import React, { useState, createContext, useContext } from 'react';
import { View, Image, Text } from 'react-native';
import { cn } from '../../lib/utils'; // Adjust path to your utils file

// --- Context to manage image loading state ---
const AvatarContext = createContext(null);

const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an <Avatar>');
  }
  return context;
};

// --- Avatar Components ---
const Avatar = ({ className, children, ...props }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <AvatarContext.Provider value={{ hasError, setHasError }}>
      <View
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className,
        )}
        {...props}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  );
};

const AvatarImage = ({ className, ...props }) => {
  const { hasError, setHasError } = useAvatar();

  if (hasError) {
    return null; // Don't render the image if it failed to load
  }

  return (
    <Image
      className={cn('aspect-square h-full w-full', className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
};

const AvatarFallback = ({ className, children, ...props }) => {
  const { hasError } = useAvatar();

  if (!hasError) {
    return null; // Don't render the fallback if the image loaded successfully
  }

  return (
    <View
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className,
      )}
      {...props}
    >
      {/* If the child is a string, wrap it in a Text component for initials */}
      {typeof children === 'string' ? (
        <Text className="text-sm font-medium text-muted-foreground">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

export { Avatar, AvatarImage, AvatarFallback };
