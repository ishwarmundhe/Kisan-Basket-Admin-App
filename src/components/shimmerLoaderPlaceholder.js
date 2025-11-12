// components/ShimmerPlaceholder.js
import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../constant/ThemeContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

const ShimmerPlaceholder = ({
  height = 100,
  width = "100%",
  borderRadius = 8,
}) => {
  const { theme } = useTheme();

  const shimmerValue = useRef(new Animated.Value(0)).current;
  const styles = StyleSheet.create({
    shimmerContainer: {
      backgroundColor: theme.primary,
      overflow: "hidden",
      marginBottom: 12,
    },
  });
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={[styles.shimmerContainer, { height, width, borderRadius }]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={["#eeeeee", "#dddddd", "#eeeeee"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};
export default ShimmerPlaceholder;
