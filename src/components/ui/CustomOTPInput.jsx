import React from 'react';
import { View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { TextInput, Text } from 'react-native-paper';

const CustomOTPInput = ({ value, onChange, length = 6 }) => {
  const inputRef = React.useRef(null);
  const inputs = Array(length).fill(0);
  const { width: screenWidth } = useWindowDimensions();

  // Calculate responsive box size
  // Account for: screen padding (24*2=48), card padding (6*4=24), gaps between boxes
  const containerPadding = 48 + 24; // Screen + Card padding
  const gapSize = 8;
  const totalGaps = (length - 1) * gapSize;
  const availableWidth = screenWidth - containerPadding - totalGaps - 16; // Extra margin

  const boxWidth = Math.floor(availableWidth / length);
  const boxHeight = boxWidth * (length === 4 ? 0.8 : 1.1); // Adjust height based on length

  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <View className="w-full">
      <TouchableOpacity onPress={handlePress}>
        <View
          className="flex-row justify-center items-center"
          style={{ gap: gapSize }}
        >
          {inputs.map((_, index) => (
            <View
              key={index}
              className={`rounded-2xl items-center justify-center border-2 ${
                value[index]
                  ? 'bg-green-50 border-[#658f3e]'
                  : 'bg-gray-100 border-gray-200'
              }`}
              style={{
                width: boxWidth,
                height: boxHeight,
              }}
            >
              <Text
                className="font-semibold text-gray-800"
                style={{ fontSize: boxWidth * 0.4 }}
              >
                {value[index] || ''}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Hidden TextInput for keyboard input */}
      <TextInput
        ref={inputRef}
        keyboardType="number-pad"
        maxLength={length}
        value={value}
        onChangeText={onChange}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        autoFocus
      />
    </View>
  );
};

export default CustomOTPInput;
