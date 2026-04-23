import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

const ImageWithFallback = ({
  src,
  alt = '',
  className,
  fallbackClassName,
  style,
  resizeMode = 'cover',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = error => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  // If there's an error or no src, show the fallback UI
  if (hasError || !src) {
    return (
      <View
        className={cn(
          'bg-muted flex items-center justify-center',
          fallbackClassName || className,
        )}
        style={style}
      >
        <Text className="text-muted-foreground text-[8px] text-center px-2">
          {alt || 'Image not available'}
        </Text>
      </View>
    );
  }

  return (
    <View className={cn('relative', className)} style={style}>
      <Image
        source={{ uri: src }}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        style={[StyleSheet.absoluteFill, style]}
        resizeMode={resizeMode}
        {...props}
      />
      {isLoading && (
        <Skeleton className={cn('absolute inset-0', className)} style={style} />
      )}
    </View>
  );
};

export { ImageWithFallback };
