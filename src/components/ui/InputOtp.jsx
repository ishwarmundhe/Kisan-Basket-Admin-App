import { useRef } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

const InputOTP = ({ value, onChange, maxLength = 4 }) => {
  const inputRefs = useRef([]);

  const handleTextChange = (text, index) => {
    const newOtp = value.split('');
    newOtp[index] = text;
    onChange(newOtp.join('').slice(0, maxLength));

    if (text && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }, index) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-center space-x-3">
      {Array.from({ length: maxLength }).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => (inputRefs.current[index] = ref)}
          className="w-14 h-14 text-center text-2xl"
          style={{ textAlign: 'center', fontSize: 24 }}
          maxLength={1}
          keyboardType="number-pad"
          value={value[index] || ''}
          onChangeText={text => handleTextChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
        />
      ))}
    </View>
  );
};

export default InputOTP;
