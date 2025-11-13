import React, { useState, useRef } from 'react';
import { View, TextInput } from 'react-native';
import { cn } from '../../lib/utils';

// --- Main InputOTP Component ---
const InputOTP = ({
  maxLength,
  value,
  onChange,
  className,
  children,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRefs = useRef([]);

  const handleTextChange = (text, index) => {
    const newValue = value.split('');
    newValue[index] = text;
    const finalValue = newValue.join('').slice(0, maxLength);
    onChange(finalValue);

    if (text && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View
      className={cn('flex-row justify-center items-center', className)}
      {...props}
    >
      {children || (
        <InputOTPGroup>
          {Array.from({ length: maxLength }).map((_, index) => (
            <InputOTPSlot
              key={index}
              value={value[index] || ''}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={text => handleTextChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              isActive={isFocused}
            />
          ))}
        </InputOTPGroup>
      )}
    </View>
  );
};

// --- InputOTPGroup ---
const InputOTPGroup = ({ className, children, ...props }) => (
  <View className={cn('flex-row items-center gap-x-2', className)} {...props}>
    {children}
  </View>
);

// --- InputOTPSlot ---
const InputOTPSlot = React.forwardRef(
  ({ className, value, isActive, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        maxLength={1}
        value={value}
        keyboardType="numeric"
        textContentType="oneTimeCode" // Enables autofill from SMS on iOS
        className={cn(
          'h-12 w-12 text-center border rounded-md bg-background text-foreground text-xl',
          'focus:border-primary focus:ring-2 focus:ring-primary', // NativeWind focus styles
          isActive && 'border-primary',
          value ? 'border-primary' : 'border-border',
          className,
        )}
        {...props}
      />
    );
  },
);

export { InputOTP, InputOTPGroup, InputOTPSlot };
