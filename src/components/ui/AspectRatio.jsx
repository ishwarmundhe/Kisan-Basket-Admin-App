import React from 'react';
import { View } from 'react-native';
import { cn } from '../../lib/utils'; // Adjust path to your utils file

const View = styled(View);

const AspectRatio = ({ ratio = 1, className, children, ...props }) => {
  return (
    <View style={{ aspectRatio: ratio }} className={cn(className)} {...props}>
      {/* The children will be stretched to fill the container */}
      {children}
    </View>
  );
};

export { AspectRatio };
