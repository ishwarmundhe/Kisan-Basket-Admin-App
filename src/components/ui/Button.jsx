import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

// --- Minimal Slot Implementation for `asChild` prop ---
const Slot = React.forwardRef(({ children, ...props }, ref) => {
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ...props,
    ref,
    // Safely merge classNames
    className: cn(child.props.className, props.className),
  });
});
Slot.displayName = "Slot";

// --- CVA Variants for the Button Container ---
const buttonVariants = cva(
  "flex-row items-center justify-center self-start rounded-md disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "",
        link: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// --- CVA Variants for the Text inside the Button ---
const buttonTextVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-destructive-foreground",
      outline: "text-accent-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-accent-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "",
      sm: "text-[8px]",
      lg: "text-base",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      textClassName,
      icon,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : TouchableOpacity;

    return (
      <Comp
        ref={ref}
        {...props}
        className={cn(buttonVariants({ variant, size }), className)}
        style={props.style} // ensures RN style works
      >
        {/* ICON SUPPORT */}
        {icon && <Text className="mr-2">{icon}</Text>}

        {/* TEXT */}
        {typeof children === "string" ? (
          <Text
            className={cn(buttonTextVariants({ variant, size }), textClassName)}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
