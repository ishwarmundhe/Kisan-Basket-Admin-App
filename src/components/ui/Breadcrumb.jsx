import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, MoreHorizontal } from 'lucide-react-native';
import { cn } from '../../lib/utils';

// --- Minimal Slot Implementation for `asChild` prop ---
const Slot = React.forwardRef(({ children, className, ...props }, ref) => {
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ...props,
    ref,
    className: cn(child.props.className, className),
  });
});
Slot.displayName = 'Slot';

// --- Breadcrumb Components ---
const Breadcrumb = ({ ...props }) => (
  <View accessibilityRole="navigation" aria-label="breadcrumb" {...props} />
);

const BreadcrumbList = ({ className, ...props }) => (
  <View
    className={cn(
      'flex-row flex-wrap items-center gap-x-2.5 gap-y-1.5',
      className,
    )}
    {...props}
  />
);

const BreadcrumbItem = ({ className, ...props }) => (
  <View
    className={cn('flex-row items-center gap-x-1.5', className)}
    {...props}
  />
);

const BreadcrumbLink = ({ asChild = false, className, ...props }) => {
  const Comp = asChild ? Slot : TouchableOpacity;
  return (
    <Comp
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  );
};

const BreadcrumbPage = ({ className, ...props }) => (
  <Text
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('text-sm font-normal text-foreground', className)}
    {...props}
  />
);

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  <View className={cn(className)} {...props}>
    {children ?? <ChevronRight size={14} className="text-muted-foreground" />}
  </View>
);

const BreadcrumbEllipsis = ({ className, ...props }) => (
  <View
    className={cn('h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal size={16} className="text-muted-foreground" />
  </View>
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
