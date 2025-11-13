import React from 'react';
import { View, Text } from 'react-native';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';
import { cn } from '../../lib/utils';

// --- Minimal Slot Implementation for `asChild` prop ---
const Slot = React.forwardRef(({ children, ...props }, ref) => {
  const child = React.Children.only(children);
  return React.cloneElement(child, { ...props, ref });
});
Slot.displayName = 'Slot';

// --- Form Components ---
const Form = FormProvider;

const FormFieldContext = React.createContext({});

const FormField = ({ ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const FormItemContext = React.createContext({});

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View ref={ref} className={cn('gap-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Text
      ref={ref}
      nativeID={formItemId}
      className={cn(
        'text-sm font-medium text-foreground',
        error && 'text-destructive',
        className,
      )}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = ({ ...props }) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      nativeID={formItemId}
      accessibilityDescribedBy={`${formDescriptionId} ${formMessageId}`}
      accessibilityInvalid={!!error}
      {...props}
    />
  );
};

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <Text
      ref={ref}
      nativeID={formDescriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) return null;

    return (
      <Text
        ref={ref}
        nativeID={formMessageId}
        className={cn('text-sm font-medium text-destructive', className)}
        {...props}
      >
        {body}
      </Text>
    );
  },
);
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
