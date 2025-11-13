import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../constant/ThemeContext";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const ReusableBottomSheet = forwardRef(({ children, height = "40%" }, ref) => {
  const { theme } = useTheme();

  const sheetHeight =
    typeof height === "string"
      ? SCREEN_HEIGHT * (parseInt(height) / 100)
      : height;

  const translateY = useSharedValue(SCREEN_HEIGHT);

  const open = () => {
    translateY.value = withSpring(SCREEN_HEIGHT - sheetHeight, {
      damping: 15,
      stiffness: 150,
    });
  };

  const close = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
  };

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = SCREEN_HEIGHT - sheetHeight + event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        close();
      } else {
        open();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    translateY.value = SCREEN_HEIGHT;
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrapper}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: theme.primary, height: sheetHeight },
            animatedStyle,
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default ReusableBottomSheet;
